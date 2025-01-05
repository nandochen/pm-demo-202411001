import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Principal } from "@dfinity/principal";

import { StandardResponseModel } from '../model/standard-response.model';


@Injectable()
export class AuthService {

  private readonly jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  async getAccessToken(principalId: string): Promise<StandardResponseModel> {
    if (!principalId) {
      return {
        ok: false,
        msg: 'Principal ID is required'
      }
    } else if (!this.isValidPrincipalId(principalId)) {
      return {
        ok: false,
        msg: `Invalid Principal ID: ${principalId}`
      }
    }

    try {
        const jwt = this.jwtService.sign({ sub: principalId }, { secret: '123456789', expiresIn: '1d'});

        return {
          ok: true,
          data: jwt
        }
    } catch (e) {
        return {
          ok: false,
          msg: `JwtService Error: ${e.message}`
        }
    }
  }

  isValidPrincipalId(principalId: string): boolean {
    // Check basic Base32 and separator rules
    const base32Regex = /^[a-z2-7-]+$/;
    // No leading, trailing, or consecutive '-'
    const separatorRegex = /(^-|-$|--)/;

    if (!base32Regex.test(principalId) || separatorRegex.test(principalId)) {
        return false;
    }

    try {
        // Use @dfinity/principal to check if it's a valid Principal
        Principal.fromText(principalId);
        return true;
    } catch (e) {
        return false;
    }
  }
}
