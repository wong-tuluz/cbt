export function mandatory<T>(value: T | null | undefined, name = 'Value'): T {
    if (value == null) {
        throw new Error(`${name} is not defined`)
    }

    return value
}
