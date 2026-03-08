/**
 * Format a number as Indonesian Rupiah (IDR).
 * Uses dot (.) as thousands separator, no decimal places.
 * Example: 50000 → "Rp 50.000", 100000 → "Rp 100.000"
 */
export function formatRupiah(amount: number | string): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "Rp 0";
    return (
        "Rp " +
        num.toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
    );
}

/**
 * Format a "cents" stored value as IDR by dividing by 100 first.
 * Used where the DB/API stores values in 1/100th units.
 * Example (cents): 5000000 → "Rp 50.000"
 */
export function formatRupiahFromCents(cents: number): string {
    return formatRupiah(Math.round(cents / 100));
}
