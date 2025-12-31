import { AddFavouriteRoomMessageComposer, DeleteFavouriteRoomMessageComposer } from '@nitrots/nitro-renderer';
import { SendMessageComposer } from '..';


export const ToggleFavoriteRoom = (roomId: number, isFavorite: boolean) =>
{
    SendMessageComposer(isFavorite ? new DeleteFavouriteRoomMessageComposer(roomId) : new AddFavouriteRoomMessageComposer(roomId));
}
