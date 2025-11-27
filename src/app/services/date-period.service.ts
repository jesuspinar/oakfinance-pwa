import { Injectable } from '@angular/core';
import { MonthPeriod } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DatePeriodService {

  constructor() { }

  /**
   * Get current period based on custom start day
   * @param startDay - Day of month (1-31) when period starts
   * @param referenceDate - Date to calculate from (default: today)
   */
  getCurrentPeriod(startDay: number, referenceDate: Date = new Date()): MonthPeriod {
    const today = new Date(referenceDate);
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDate();
    
    let periodStart: Date;
    
    if (currentDay >= startDay) {
      // We're in the current month's period
      periodStart = new Date(today.getFullYear(), today.getMonth(), startDay);
    } else {
      // We're in the previous month's period
      periodStart = new Date(today.getFullYear(), today.getMonth() - 1, startDay);
    }
    
    periodStart.setHours(0, 0, 0, 0);
    
    // Period ends the day before next period starts
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(periodEnd.getDate() - 1);
    periodEnd.setHours(23, 59, 59, 999);
    
    return {
      periodStart,
      periodEnd,
      displayLabel: this.formatPeriodLabel(periodStart, periodEnd)
    };
  }
  
  /**
   * Navigate to next period
   */
  getNextPeriod(currentPeriod: MonthPeriod): MonthPeriod {
    const nextStart = new Date(currentPeriod.periodStart);
    nextStart.setMonth(nextStart.getMonth() + 1);
    nextStart.setHours(0, 0, 0, 0);
    
    const nextEnd = new Date(nextStart);
    nextEnd.setMonth(nextEnd.getMonth() + 1);
    nextEnd.setDate(nextEnd.getDate() - 1);
    nextEnd.setHours(23, 59, 59, 999);
    
    return {
      periodStart: nextStart,
      periodEnd: nextEnd,
      displayLabel: this.formatPeriodLabel(nextStart, nextEnd)
    };
  }
  
  /**
   * Navigate to previous period
   */
  getPreviousPeriod(currentPeriod: MonthPeriod): MonthPeriod {
    const prevStart = new Date(currentPeriod.periodStart);
    prevStart.setMonth(prevStart.getMonth() - 1);
    prevStart.setHours(0, 0, 0, 0);
    
    const prevEnd = new Date(prevStart);
    prevEnd.setMonth(prevEnd.getMonth() + 1);
    prevEnd.setDate(prevEnd.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    
    return {
      periodStart: prevStart,
      periodEnd: prevEnd,
      displayLabel: this.formatPeriodLabel(prevStart, prevEnd)
    };
  }
  
  /**
   * Calculate actual due date for a payment in a period
   * Handles edge cases (e.g., 31st in February)
   */
  calculateDueDate(dayOfMonth: number, period: MonthPeriod): Date {
    const { periodStart, periodEnd } = period;
    
    // Determine which calendar month the due day falls in
    let targetMonth: Date;
    
    if (periodStart.getMonth() === periodEnd.getMonth()) {
      // Period within same calendar month
      targetMonth = new Date(periodStart);
    } else {
      // Period spans two months
      if (dayOfMonth >= periodStart.getDate()) {
        targetMonth = new Date(periodStart); // Use start month
      } else {
        targetMonth = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), 1);
      }
    }
    
    // Create due date, handling month-end edge cases
    const dueDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), dayOfMonth);
    dueDate.setHours(0, 0, 0, 0);
    
    // If day doesn't exist in month (e.g., Feb 31), it auto-adjusts to next month
    // Check if we need to cap at month end
    if (dueDate.getMonth() !== targetMonth.getMonth()) {
      // Overflowed, use last day of target month
      return new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 0, 0, 0, 0);
    }
    
    return dueDate;
  }
  
  /**
   * Format period dates as display label
   */
  private formatPeriodLabel(start: Date, end: Date): string {
    const startStr = start.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric' 
    });
    const endStr = end.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric' 
    });
    return `${startStr} - ${endStr}`;
  }

  /**
   * Get period key for storage
   */
  getPeriodKey(period: MonthPeriod): string {
    return period.periodStart.toISOString().split('T')[0];
  }
}
