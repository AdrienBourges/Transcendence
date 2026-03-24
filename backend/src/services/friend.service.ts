import prisma from "../prisma.js";
import { ApiError } from "../utils/ApiError.js";

export async function addFriend(userId: number, friendId: number) {
    if(userId == friendId)
        throw new ApiError(400, "cannot add yourself as friend")

const friend = await prisma.user.findUnique({
  where: { id: friendId }
})
if (friend === null)
  throw new ApiError(404, "user not found")

const relation = await prisma.friendship.findUnique({
  where: {
  userId_friendId :
  { userId: userId , friendId : friendId}}
})
if (relation !== null)
  throw new ApiError(409, "relation already exists")

await prisma.friendship.create({
    data : {
        userId : userId, 
        friendId : friendId
    }
})
}


export async function removeFriend(userId: number, friendId: number) {
const relation = await prisma.friendship.findUnique({
  where: {
  userId_friendId :
  { userId: userId , friendId : friendId}}
})
if (relation === null)
  throw new ApiError(404, "relation doesn't exist")

await prisma.friendship.delete({
    where : {
        userId_friendId: {
        userId : userId, 
        friendId : friendId
        }
    }
})
}

export async function getFriends(userId: number) {
	const result = await prisma.friendship.findMany({
		where: {
			userId: userId,
		},
		select: {
			friend: {
				select: {
					id: true,
					username: true,
					profile: {
						select: {
							avatarUrl: true,
							languages: true,
							discord: true,
							pronouns: true,
						},
					},
				},
			},
		},
	});
	return result.map((f) => f.friend);
}
