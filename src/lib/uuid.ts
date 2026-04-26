const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// URL パラメータなどで受け取った文字列がUUID形式かを判定する
export function isUuid(value: null | string | undefined): value is string {
    if (!value) {
        return false;
    }

    return UUID_PATTERN.test(value);
}
