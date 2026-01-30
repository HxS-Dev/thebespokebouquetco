import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CreditCard, Lock, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { CartItem } from '../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

// Base location (shop location)
const SHOP_LOCATION = { lat: 51.5074, lng: -0.1278 }; // London - update with actual shop location

// Calculate delivery price based on distance
const calculateDeliveryPrice = (distance: number): number => {
  // Base delivery fee
  const baseFee = 5;

  // $2 per km
  const distanceFee = distance * 2;

  return Math.round(baseFee + distanceFee);
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Map click handler component
function LocationMarker({ setLocation }: { setLocation: (loc: LocationData) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Reverse geocoding to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          setLocation({
            lat,
            lng,
            address: data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
        })
        .catch(() => {
          setLocation({
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
        });
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Delivery Location</Popup>
    </Marker>
  );
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  isOpen,
  onClose,
  items,
  subtotal
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [distance, setDistance] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate delivery price when location changes
  useEffect(() => {
    if (location) {
      const dist = calculateDistance(
        SHOP_LOCATION.lat,
        SHOP_LOCATION.lng,
        location.lat,
        location.lng
      );
      setDistance(dist);
      setDeliveryPrice(calculateDeliveryPrice(dist));
    }
  }, [location]);

  const total = subtotal + deliveryPrice;
  const canCheckout = location !== null && acceptedTerms;

  const handleCheckout = async () => {
    if (!canCheckout) return;

    setIsProcessing(true);

    // TODO: Integrate with Stripe Payment Element
    // For now, just simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert('Payment processing would happen here with Stripe!');
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Checkout Page */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-lg shadow-2xl z-[201] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-cream-light">
              <h2 className="font-serif text-3xl text-stone-dark">Checkout</h2>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column - Delivery & Payment */}
                <div className="space-y-6">

                  {/* Delivery Location */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-rose-dust" />
                      <h3 className="font-serif text-xl text-stone-dark">Delivery Location</h3>
                    </div>

                    <p className="text-sm text-stone-600 mb-4">
                      Click on the map to select your delivery location. Delivery price will be calculated based on distance from our shop.
                    </p>

                    {/* Map */}
                    <div className="h-64 rounded-lg overflow-hidden border border-stone-300 mb-4">
                      <MapContainer
                        center={[SHOP_LOCATION.lat, SHOP_LOCATION.lng]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <LocationMarker setLocation={setLocation} />
                      </MapContainer>
                    </div>

                    {location && (
                      <div className="bg-white p-4 rounded border border-stone-200">
                        <p className="text-sm text-stone-600 mb-1">Selected Location:</p>
                        <p className="text-sm font-medium text-stone-dark mb-2">{location.address}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-stone-500">Distance from shop:</span>
                          <span className="font-medium text-stone-dark">{distance.toFixed(1)} km</span>
                        </div>
                      </div>
                    )}

                    {!location && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm">Please select a delivery location on the map</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Section (Placeholder for Stripe) */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-rose-dust" />
                      <h3 className="font-serif text-xl text-stone-dark">Payment Details</h3>
                    </div>

                    <div className="bg-stone-100 p-8 rounded border border-dashed border-stone-300 text-center">
                      <Lock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-sm text-stone-600">Stripe Payment Element will be embedded here</p>
                      <p className="text-xs text-stone-400 mt-1">Secure payment processing via Stripe</p>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 accent-rose-dust cursor-pointer"
                      />
                      <span className="text-sm text-stone-600">
                        I agree to the{' '}
                        <button
                          onClick={() => setShowTerms(true)}
                          className="text-rose-dust underline hover:text-stone-dark transition-colors"
                        >
                          Terms and Conditions
                        </button>
                      </span>
                    </label>

                    {!acceptedTerms && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded border border-amber-200 mt-3">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm">You must accept the terms and conditions to proceed</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Order Summary */}
                <div className="lg:sticky lg:top-0 h-fit">
                  <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
                    <h3 className="font-serif text-2xl text-stone-dark mb-6">Order Summary</h3>

                    {/* Items */}
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item._id} className="flex gap-3">
                          <div className="w-16 h-16 bg-stone-200 rounded overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-stone-dark">{item.name}</h4>
                            <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-stone-dark">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="border-t border-stone-300 pt-4 space-y-2">
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Delivery</span>
                        <span className="font-medium">
                          {location ? `$${deliveryPrice.toFixed(2)}` : 'Select location'}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-serif text-stone-dark pt-2 border-t border-stone-300">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      disabled={!canCheckout || isProcessing}
                      className="w-full mt-6 py-4 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-all duration-300 rounded-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Complete Payment ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Terms and Conditions Modal */}
          <AnimatePresence>
            {showTerms && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowTerms(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[202]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-8 md:inset-16 lg:inset-24 bg-white rounded-lg shadow-2xl z-[203] overflow-hidden flex flex-col"
                >
                  <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-cream-light">
                    <h3 className="font-serif text-2xl text-stone-dark">Terms and Conditions</h3>
                    <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                      <X className="w-5 h-5 text-stone-500" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 prose prose-stone max-w-none">
                    <h4>1. Delivery Terms</h4>
                    <p>
                      All deliveries are subject to availability. Delivery times are estimates and may vary based on location and traffic conditions.
                      We strive to deliver fresh flowers within the specified timeframe.
                    </p>

                    <h4>2. Product Quality</h4>
                    <p>
                      All our bouquets are hand-tied using fresh, seasonal flowers. While we make every effort to match the displayed arrangements,
                      slight variations may occur due to seasonal availability.
                    </p>

                    <h4>3. Cancellation Policy</h4>
                    <p>
                      Orders can be cancelled up to 24 hours before the scheduled delivery time for a full refund. Cancellations made within 24 hours
                      of delivery may incur a 50% cancellation fee.
                    </p>

                    <h4>4. Refund Policy</h4>
                    <p>
                      If you are not satisfied with your order, please contact us within 48 hours of delivery. We will assess the issue and offer
                      a replacement or refund as appropriate.
                    </p>

                    <h4>5. Privacy</h4>
                    <p>
                      We respect your privacy and will never share your personal information with third parties without your consent.
                      All payment information is processed securely through Stripe.
                    </p>

                    <h4>6. Contact</h4>
                    <p>
                      For any questions or concerns, please contact us at hello@bespokebouquet.co
                    </p>
                  </div>
                  <div className="p-6 border-t border-stone-200 bg-cream-light">
                    <button
                      onClick={() => {
                        setAcceptedTerms(true);
                        setShowTerms(false);
                      }}
                      className="w-full py-3 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-all duration-300 rounded-sm"
                    >
                      Accept Terms
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};
