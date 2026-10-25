import { Controller, Get, Post } from "../decorators.js"

@Controller("users")
export class UserController {
    @Get()
    list() {}

    @Post()
    create() {}
}
