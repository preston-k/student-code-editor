const STUDENT_KEY = 'spark_student';

export function getStudentName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STUDENT_KEY);
}

export function signIn(name: string): void {
  localStorage.setItem(STUDENT_KEY, name.trim().slice(0, 40));
}

export function signOut(): void {
  localStorage.removeItem(STUDENT_KEY);
}
