import { Role } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { User } from "next-auth"
import React from "react"

type UserAvatarProps = {
  user?: User & { role: Role }
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const url = user?.image
    ? user.image
    : `https://api.dicebear.com/7.x/initials/svg?${new URLSearchParams({
        scale: "80",
        backgroundType: "gradientLinear",
        seed: user?.email || "User",
      }).toString()}`

  // const initials = user?.name?.slice(0, 1).toUpperCase() || ""

  return (
    <Avatar>
      <AvatarImage src={url} alt='User Avatar' />
      <AvatarFallback className='uppercase' />
    </Avatar>
  )
}

export default UserAvatar
