import { Star } from "lucide-react";
import { MarketListing, PlayerProfile } from "@/app/lib/MultiplayerContext";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";

export function MarketTab({
  listings,
  currentUser,
  onBuy,
}: {
  listings: MarketListing[];
  currentUser: PlayerProfile;
  onBuy: (l: MarketListing) => void;
}) {
  const { removeListing } = useMultiplayer();
  const activeListings = listings.filter((l) => l.status === "active");

  if (activeListings.length === 0) {
    return (
      <p className="text-center text-stone-500 py-10 border-2 border-dashed border-stone-300 rounded-xl">
        The market is empty. Be the first to list a reward!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {activeListings.map((listing) => (
        <div
          key={listing.id}
          className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-col gap-3 relative overflow-hidden"
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="font-bold text-lg">{listing.itemName}</h3>
              <p className="text-xs text-stone-500 mt-1 uppercase tracking-wider font-bold">
                Sold by {listing.sellerName}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full text-amber-700 font-bold shrink-0">
              <Star size={16} className="fill-amber-500 text-amber-500" />{" "}
              {listing.price}
            </div>
          </div>
          <p className="text-stone-700 text-sm bg-stone-50 p-3 rounded-lg border border-stone-100 z-10">
            {listing.description}
          </p>
          {currentUser.id !== listing.sellerId ? (
            <button
              onClick={() => onBuy(listing)}
              disabled={currentUser.stars < listing.price}
              className="mt-2 w-full bg-stone-900 text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-stone-800 transition z-10"
            >
              {currentUser.stars < listing.price
                ? "Not Enough Stars"
                : "Buy with Stars"}
            </button>
          ) : (
            <div className="mt-2 text-center text-xs font-bold text-amber-600 uppercase tracking-widest py-3 border-t border-amber-100 z-10">
              This is your listing
            </div>
          )}
          {listing.sellerId === currentUser.id ? (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => removeListing(listing.id)}
                className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold"
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
