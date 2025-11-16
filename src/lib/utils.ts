// Utility functions

export function validateIndianMobile(mobile: string): boolean {
  const pattern = /^[6-9]\d{9}$/;
  return pattern.test(mobile);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getFullName(firstName: string, fatherName: string, surname: string): string {
  return `${firstName} ${fatherName} ${surname}`;
}

export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
