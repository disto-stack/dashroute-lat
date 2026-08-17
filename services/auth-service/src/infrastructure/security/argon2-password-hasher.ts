import { Injectable } from '@nestjs/common';
import argon2 from 'argon2';
import { type IPasswordHasher } from '../../domain/ports/password-hasher.port.js';

@Injectable()
export class Argon2PasswordHasher implements IPasswordHasher {
  async hash(plainText: string): Promise<string> {
    return argon2.hash(plainText);
  }

  async verify(hash: string, plainText: string): Promise<boolean> {
    return argon2.verify(hash, plainText);
  }
}
