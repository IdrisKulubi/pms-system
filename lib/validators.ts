export function isValidEmail(email: string): boolean {
  // Regex pattern for name.surname@companydomain format
  const emailPattern = /^[A-Z][a-z]+\.[A-Z][a-z]+@(kcicconsulting|impactingafrica)\.com$/;
  return emailPattern.test(email);
}

export function formatEmail(name: string, surname: string): string {
  return `${name.toLowerCase()}.${surname.toLowerCase()}@${getCompanyDomain()}`;
}

function getCompanyDomain(): string {
  // You could make this configurable via environment variables if needed
  return process.env.NODE_ENV === 'production' 
    ? 'kcicconsulting.com' 
    : 'impactingafrica.com';
} 