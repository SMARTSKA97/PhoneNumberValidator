// app.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, FormsModule, RouterOutlet],
})
export class AppComponent {
  phoneNumber: string = '';
  isValid: boolean | null = null;

  checkValidity() {
    const cleaned = this.phoneNumber.replace(/\D/g, '');
    
    // Basic checks
    if (cleaned.length !== 10) {
      this.isValid = false;
      return;
    }

    // Indian specific validations
    const firstDigit = cleaned[0];
    const validFirstDigits = ['6', '7', '8', '9'];
    
    // Check for valid starting digit
    if (!validFirstDigits.includes(firstDigit)) {
      this.isValid = false;
      return;
    }

    // Check for libphonenumber validation
    const phone = parsePhoneNumberFromString(cleaned, 'IN');
    if (!phone || !phone.isValid()) {
      this.isValid = false;
      return;
    }

    // Additional pattern checks
    if (this.hasRepeatingDigits(cleaned) || 
        this.isSequentialNumber(cleaned) || 
        this.hasConsecutiveRepeat(cleaned)) {
      this.isValid = false;
      return;
    }

    this.isValid = true;
  }

  // Check for all identical digits
  private hasRepeatingDigits(num: string): boolean {
    return new Set(num.split('')).size === 1;
  }

  // Check for sequential numbers (e.g., 1234567890 or 9876543210)
  private isSequentialNumber(num: string): boolean {
    const ascending = '0123456789';
    const descending = '9876543210';
    return num === ascending || num === descending;
  }

  // Check for 4+ consecutive identical digits
  private hasConsecutiveRepeat(num: string): boolean {
    return (/(\d)\1{3,}/).test(num);
  }
}