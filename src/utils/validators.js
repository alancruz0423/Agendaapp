
//Validador de email
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  if (!phone) return false;
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

export function isStrongPassword(password) {
  if (!password) return false;
  return password.length >= 6 && 
         /[a-zA-Z]/.test(password) && 
         /\d/.test(password);
}


export function isValidUsername(username) {
  if (!username) return false;
  return /^[a-zA-Z0-9_-]{3,50}$/.test(username);
}

export function isValidImage(file, maxSizeMB = 5) {
  if (!file) return { valid: false, error: 'No se seleccionó ningún archivo' };
  
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no permitido. Use JPG, PNG o WEBP' };
  }
  
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `El archivo debe pesar menos de ${maxSizeMB}MB` };
  }
  
  return { valid: true };
}

export function required(value, fieldName = 'Este campo') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} es requerido`;
  }
  return null;
}

export function createValidator(rules) {
  return function validate(value, fieldName) {
    for (const rule of rules) {
      const error = rule(value, fieldName);
      if (error) return error;
    }
    return null;
  };
}