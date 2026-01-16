export const accessOptions = {
    httpOnly:true,
    secure:true,
    sameSite: "lax",
    path:"/",
    maxAge:15*60*1000
}

export const refreshOptions = {
    httpOnly:true,
    secure:true,
    sameSite:"lax",
    path:"/",
    maxAge:30*24*60*60*1000
}

