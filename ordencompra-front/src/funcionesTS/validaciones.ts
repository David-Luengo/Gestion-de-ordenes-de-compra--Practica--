// Function to validate Emails
export function validarEmail(email: string) {
  const emailRegex = /^[a-zA-Z0-9._%+-áéíóúÁÉÍÓÚüÜñÑ]*@[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

  // Function to validate an email address
  return emailRegex.test(email);
}

// Function to validate a password
export function validarPassword(password: string): boolean {
  const passwordRegex = /^.{5,}$/;
  return passwordRegex.test(password);
}

export function validarRUT(rut: string) {
  // Validar que el RUT tenga el formato correcto
  // const RUT_REGEX = /^([1-9]|[1-9]\d|[1-9]\d{2})((\.\d{3})*|(\d{3})*)\-(\d|k|K)$/;
  // const RUT_REGEX = /^[1-9]\d{0,1}(\.\d{3})*-\d|K|k$|^[1-9]\d{7}-\d|K|k$/
  const RUT_REGEX = /^[1-9]\d{0,1}(\.\d{3}\.\d{3}|\d{6,7})-\d|K|k$/


  if (!RUT_REGEX.test(rut)) {
    return false;
  }

  // Eliminar espacios y guiones del RUT
  rut = rut.replace(/[^\dkK]+/g, "").toUpperCase();
  rut = rut.replace(/[-\s]/g, "");

  // Separar el número y el dígito verificador
  var num = rut.slice(0, -1);
  var digv = rut.slice(-1);

  // Calcular el dígito verificador
  var suma = 0;
  var multiplo = 2;
  for (var i = num.length - 1; i >= 0; i--) {
    suma += parseInt(num.charAt(i)) * multiplo;
    if (multiplo < 7) {
      multiplo += 1;
    } else {
      multiplo = 2;
    }
  }

  var dv: string;
  var resto = suma % 11;
  var dvCalculado = 11 - resto;

  if (dvCalculado === 11) {
    dv = "0";
  } else if (dvCalculado === 10) {
    dv = "K";
  } else {
    dv = dvCalculado.toString();
  }

  if (dv !== digv) {
    return false;
  }

  return true;
}

// Function to validate username
export function validarUsername(username: string): boolean {
  // Regular expression pattern for username validation with letters, hyphen, and underscore
  const usernameRegex = /^[A-Za-z0-9._\-ñÑ]{5,15}$/;
  return usernameRegex.test(username);
}

// Function to validate Chilean phone numbers
export function validarNumeroTel(phoneNumber: string): boolean {
  // Define the regular expression pattern for Chilean mobile (cellphone) numbers
  const chileanMobileNumberPattern = /^(?:\+56|56)?(?:9[0-9])(?:\d{7})$/;

  // Use the RegExp test method to check if the phone number matches the pattern
  return chileanMobileNumberPattern.test(phoneNumber);
}

// Function to validate only numbers
export function validarCuentaContable(input: number): boolean {
  return !isNaN(input) && input > 0;
}

// Function to validate only text and numbers
export function validarAddress(address: string): boolean {
  const addressPattern = /^[a-zA-Z0-9\s.,#\-áéíóúñÁÉÍÓÚÑ]+$/i;
  return addressPattern.test(address);
}

// Function to validate text
export function validarText(input: string): boolean {
  const textWithSpacesPattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/i;
  return textWithSpacesPattern.test(input);
}

export function validarNombreProveedor(nombre: string): boolean {
  const textWithSpacesAndDotPattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s.]+$/i;
  return textWithSpacesAndDotPattern.test(nombre);
}

export function validarNumeroEntero(texto: string): boolean {
  try {
    const numero = parseInt(texto);
    return !isNaN(numero) && Number.isInteger(numero) && numero > 0;

  } catch (e) {
    return false
  }

}

//FUNCIONES ESPECIALES PARA COTIZACIONES CON CAMPOS OPCIONALES
export function validarTextOpcional(input: string): boolean {
  return input === '' || /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]+$/i.test(input);
}

export function validarNumeroTelOpcional(phoneNumber: string): boolean {
  return phoneNumber === '' || /^(?:\+56|56)?(?:9[0-9])(?:\d{7})$/.test(phoneNumber);
}

export function validarEmailOpcional(email: string) {
  return email === '' || /^[a-zA-Z0-9._%+-áéíóúÁÉÍÓÚüÜñÑ]*@[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(email);
}