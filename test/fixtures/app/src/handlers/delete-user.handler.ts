export function removeUser(id: string, force: boolean) {
    return force ? id : undefined
}
