function regex() {
  return /^[\s\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+$/;
}

export function isEmptyOrBlank(value: string) {
  return regex().test(value) || value === '';
}
