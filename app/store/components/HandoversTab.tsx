import { Package, CheckCircle, XCircle } from "lucide-react";
import {
  Order,
  MarketListing,
  PlayerProfile,
} from "@/app/lib/MultiplayerContext";

export function HandoversTab({
  orders,
  listings,
  currentUser,
  onHandover,
  onCancel,
}: any) {
  const pendingOrders = orders.filter(
    (o: Order) => o.status === "pending_handover",
  );

  if (pendingOrders.length === 0) {
    return (
      <p className="text-center text-stone-500 py-10">
        You have no pending handovers.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {pendingOrders.map((order: Order) => {
        const amSeller = order.sellerId === currentUser.id;
        const listing = listings.find(
          (l: MarketListing) => l.id === order.listingId,
        );

        return (
          <div
            key={order.id}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 w-1.5 h-full ${amSeller ? "bg-amber-400" : "bg-blue-400"}`}
            ></div>
            <div
              className={`flex items-center gap-2 font-bold mb-3 text-sm uppercase tracking-wider ${amSeller ? "text-amber-600" : "text-blue-600"}`}
            >
              <Package size={18} />{" "}
              {amSeller ? "You must hand this over" : "Waiting for pickup"}
            </div>
            <h3 className="font-bold text-xl">{order.itemName}</h3>
            <p className="text-sm text-stone-600 mb-4">
              {amSeller ? `Bought by: ` : `Seller: `}{" "}
              <span className="font-bold text-stone-900">
                {amSeller ? order.buyerName : listing?.sellerName || "Unknown"}
              </span>
            </p>
            <div className="bg-stone-50 p-4 rounded-lg text-sm border border-stone-100 mb-4">
              <span className="font-bold text-stone-400 uppercase tracking-wider text-xs block mb-2">
                Instructions
              </span>
              <p className="text-stone-700">
                {listing?.redemptionInstructions || "Check with the seller!"}
              </p>
            </div>
            {amSeller && (
              <div className="flex gap-2">
                <button
                  onClick={() => onHandover(order)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle size={18} /> Given to Buyer
                </button>
                <button
                  onClick={() => onCancel(order)}
                  className="px-5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition"
                  title="Cancel and Refund"
                >
                  <XCircle size={18} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
