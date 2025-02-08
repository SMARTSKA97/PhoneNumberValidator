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
  isVanity: boolean = false;
  vanityMessage: string = '';

  checkValidity() {
    const cleaned = this.phoneNumber.replace(/\D/g, '');
    this.isValid = null;
    this.isVanity = false;
    this.vanityMessage = '';

    // Basic checks
    if (cleaned.length !== 10) {
      this.isValid = false;
      return;
    }

    // Indian specific validations
    const firstDigit = cleaned[0];
    const validFirstDigits = ['6', '7', '8', '9'];
    
    if (!validFirstDigits.includes(firstDigit)) {
      this.isValid = false;
      return;
    }

    // Libphonenumber validation
    const phone = parsePhoneNumberFromString(cleaned, 'IN');
    if (!phone || !phone.isValid()) {
      this.isValid = false;
      return;
    }

    // Fake number pattern checks
    if (this.hasRepeatingDigits(cleaned) || 
        this.isSequentialNumber(cleaned)) {
      this.isValid = false;
      return;
    }

    // Vanity number detection
    this.detectVanityPatterns(cleaned);

    this.isValid = true;
  }

  private detectVanityPatterns(num: string): void {
    const vanityPatterns = [
      { pattern: /(\d)\1{4}$/, description: 'Last 5 digits identical' },
      { pattern: /77777$/, description: 'Last 5 digits are 7s' },
      { pattern: /(\d)\1{5}$/, description: 'Last 6 digits identical' },
      { pattern: /(\d{3})\1{2}$/, description: 'Group of 3 digits repeats thrice' },
      { pattern: /(\d{5})\1$/, description: 'First 5 digits repeat' },
      { pattern: /(?=\d{6}$)0?1?2?3?4?5?6?7?8?9?$/, description: 'Last 6 digits in ascending order' },
      { pattern: /(?=\d{5}$)0?1?2?3?4?5?6?7?8?9?$/, description: 'Last 5 digits in ascending order' },
      { pattern: /(\d)\1{3}$/, description: 'Last 4 digits identical' },
      { pattern: /(\d{4})\1$/, description: 'Group of 4 digits repeats twice' },
      { pattern: /(\d{2})\1\1$/, description: 'Group of 2 digits repeats thrice' },
      { pattern: /1008$/, description: 'Last 4 digits ending with 1008' },
    ];

    for (const vp of vanityPatterns) {
      if (vp.pattern.test(num)) {
        this.isVanity = true;
        this.vanityMessage = `⚠️ Vanity number detected (${vp.description}). Additional charges may apply.`;
        break;
      }
    }
  }

  private hasRepeatingDigits(num: string): boolean {
    return new Set(num.split('')).size === 1;
  }

  private isSequentialNumber(num: string): boolean {
    const ascending = '0123456789';
    const descending = '9876543210';
    return num === ascending || num === descending;
  }
}