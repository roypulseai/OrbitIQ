import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { ObjectType, Field, InputType } from "@nestjs/graphql";
import { UsersService } from "./users.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { AuthenticatedUser } from "../auth/jwt.strategy";
import { Public } from "../auth/public.decorator";

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  orgId: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  ssoSubject?: string;

  @Field(() => JSON)
  attributes: Record<string, unknown>;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class CreateUserInput {
  @Field()
  orgId: string;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  ssoSubject?: string;

  @Field(() => JSON, { nullable: true })
  attributes?: Record<string, unknown>;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => JSON, { nullable: true })
  attributes?: Record<string, unknown>;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: "users" })
  async findAll(@Args("orgId") orgId: string): Promise<User[]> {
    return this.usersService.findAll(orgId);
  }

  @Query(() => User, { name: "user" })
  async findOne(@Args("id", { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: "me" })
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser): Promise<User> {
    return this.usersService.findOrCreateFromToken(user);
  }

  @Mutation(() => User)
  async createUser(@Args("input") input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  async updateUser(
    @Args("id", { type: () => ID }) id: string,
    @Args("input") input: UpdateUserInput
  ): Promise<User> {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
    return this.usersService.delete(id);
  }
}
