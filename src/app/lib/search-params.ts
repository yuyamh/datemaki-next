// クエリパラメータが配列で渡される可能性があるため、最初の値を取り出す
export function getSingleSearchParamValue(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
}

// 空文字や空白だけの値は、検索条件なしとして扱う
export function normalizeSearchText(value: null | string) {
    if (!value) {
        return;
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return;
    }

    return normalizedValue;
}

// 整数の文字列を、1以上の数値へ変換する
export function parsePositiveInteger(value: null | string) {
    if (!value) {
        return;
    }

    const parsedValue = Number.parseInt(value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 1) {
        return;
    }

    return parsedValue;
}
