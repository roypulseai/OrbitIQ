import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

export interface JwtPayload {
  sub: string;
  email: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  org_id?: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  orgId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const issuerUrl = configService.get("AUTH_KEYCLOAK_ISSUER", "http://localhost:8081/realms/orbitiq");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: issuerUrl,
      secretOrKey: configService.get("AUTH_JWT_SECRET", "orbitiq-dev-public-key"),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException("Invalid token: missing sub or email");
    }

    const roles = payload.realm_access?.roles ?? [];

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name || [payload.given_name, payload.family_name].filter(Boolean).join(" ") || payload.email,
      roles,
      orgId: payload.org_id || "org-default",
    };
  }
}
