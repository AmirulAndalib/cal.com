import { UserRepository } from "@/modules/user/user-repository.service";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";

class BaseStrategy {
  success!: (user: unknown) => void;
  error!: (error: Error) => void;
}

@Injectable()
export class NextAuthMockStrategy extends PassportStrategy(BaseStrategy, "next-auth") {
  constructor(private readonly email: string, private readonly userRepository: UserRepository) {
    super();
  }
  async authenticate() {
    try {
      const user = await this.userRepository.findByEmail(this.email);
      if (!user) {
        throw new Error("User not found");
      }

      return this.success(user);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) return this.error(error);
    }
  }
}