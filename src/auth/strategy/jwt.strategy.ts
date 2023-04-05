import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt'
) {
  constructor(
    config: ConfigService,
    private primsa: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET')
    });
  }

  async validate(payload: {
    sub: number,
    email: string;
  }) {
    const user = await this.primsa.user.findUnique({
      where: {
        id: payload.sub
      }
    });

    delete user.hash;
    return user;
  }
}