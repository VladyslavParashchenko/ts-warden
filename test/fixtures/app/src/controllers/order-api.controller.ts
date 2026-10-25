import { Get } from "../decorators.js"

export class OrderController {
    @Get()
    list() {}

    remove() {
        this.validate()
    }

    private validate() {}
}
