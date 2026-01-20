// frontend/utils/avatar.js
export function getAvatarFallback(name) {
    // trả về chữ cái đầu tên, hoặc "U" nếu không có tên
    return name?.charAt(0).toUpperCase() || "U"
}

export function getAvatarColor(name) {

    const colors = [
        // danh sách màu nền khác nhau
        "bg-purple-200 text-blue-800",
        "bg-violet-200 text-green-800",
    ]
    // nếu không có tên, trả về màu mặc định
    if (!name) return colors[0]
    // chọn màu dựa trên mã char đầu tiên của tên
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
}
