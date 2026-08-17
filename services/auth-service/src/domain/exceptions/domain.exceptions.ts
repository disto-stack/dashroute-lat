export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid email or password');
  }
}

export class UserNotFoundException extends DomainException {
  constructor(idOrEmail: string) {
    super(`User with identifier "${idOrEmail}" not found`);
  }
}

export class InvalidTokenException extends DomainException {
  constructor(reason = 'Invalid or expired token') {
    super(reason);
  }
}

export class CourierNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Courier with identifier "${id}" not found`);
  }
}

