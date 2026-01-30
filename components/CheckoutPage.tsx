import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Truck, Package, Store, Instagram, Mail, ChevronDown, AlertCircle, Check, Loader2, Calendar } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { CartItem, CartItemCustom } from '../types';

// EmailJS Configuration - Replace these with your actual EmailJS credentials
// Sign up at https://www.emailjs.com/ (free tier available)
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',        // e.g., 'service_abc123'
  ownerTemplateId: 'YOUR_OWNER_TEMPLATE_ID',  // Template for order notification to you
  customerTemplateId: 'YOUR_CUSTOMER_TEMPLATE_ID', // Template for confirmation to customer
  publicKey: 'YOUR_PUBLIC_KEY',        // Your EmailJS public key
};

// Shop email address
const SHOP_EMAIL = 'hello@bespokebouquet.co';

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customItems?: CartItemCustom[];
  subtotal: number;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Shop locations for distance calculation
const SHOP_LOCATIONS = [
  { postcode: 'SL4 3LR', lat: 51.4816, lng: -0.6095, name: 'Windsor' },
  { postcode: 'MK5 8DJ', lat: 52.0250, lng: -0.7590, name: 'Milton Keynes' },
];

const PERSONAL_DELIVERY_PRICE = 10;
const ROYAL_MAIL_PRICE = 8;
const MAX_LOCAL_DISTANCE_MILES = 10;

// FAQ items - placeholder content, to be updated later
const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How long will my flowers last?',
    answer: 'Content to be provided.',
  },
  {
    question: 'Do you deliver on weekends?',
    answer: 'Content to be provided.',
  },
  {
    question: 'Can I change my order after placing it?',
    answer: 'Content to be provided.',
  },
  {
    question: 'What areas do you deliver to?',
    answer: 'Content to be provided.',
  },
];

// Calculate distance between two coordinates (Haversine formula) in miles
const calculateDistanceMiles = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// FAQ Accordion Item
const FAQAccordion: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({ item, isOpen, onToggle }) => (
  <div className="border-b border-stone-200">
    <button
      onClick={onToggle}
      className="w-full py-4 flex items-center justify-between text-left hover:text-rose-dust transition-colors"
    >
      <span className="font-serif text-stone-dark">{item.question}</span>
      <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="pb-4 text-stone-600 text-sm leading-relaxed">{item.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

type DeliveryOption = 'personal' | 'collection' | 'royalmail';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  isOpen,
  onClose,
  items,
  customItems = [],
  subtotal
}) => {
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [isLocalDelivery, setIsLocalDelivery] = useState<boolean | null>(null);
  const [isCheckingPostcode, setIsCheckingPostcode] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');

  // Calculate minimum delivery date (1 week from today)
  const getMinDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const formatDeliveryDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Check if postcode is within delivery range
  const checkPostcode = async () => {
    if (!postcode.trim()) {
      setPostcodeError('Please enter a postcode');
      return;
    }

    setIsCheckingPostcode(true);
    setPostcodeError('');
    setDeliveryOption(null);

    try {
      // Use postcodes.io API to geocode the postcode
      const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`);
      const data = await response.json();

      if (data.status !== 200 || !data.result) {
        setPostcodeError('Invalid postcode. Please check and try again.');
        setIsLocalDelivery(null);
        return;
      }

      const { latitude, longitude } = data.result;

      // Check distance from both shop locations
      let minDistance = Infinity;
      for (const shop of SHOP_LOCATIONS) {
        const distance = calculateDistanceMiles(latitude, longitude, shop.lat, shop.lng);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      setIsLocalDelivery(minDistance <= MAX_LOCAL_DISTANCE_MILES);
    } catch (error) {
      setPostcodeError('Unable to verify postcode. Please try again.');
      setIsLocalDelivery(null);
    } finally {
      setIsCheckingPostcode(false);
    }
  };

  // Reset delivery option when local delivery status changes
  useEffect(() => {
    setDeliveryOption(null);
  }, [isLocalDelivery]);

  // Reset email states when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmailSent(false);
      setEmailError('');
    }
  }, [isOpen]);

  // Calculate delivery price
  const getDeliveryPrice = () => {
    if (!deliveryOption) return 0;
    if (deliveryOption === 'collection') return 0;
    if (deliveryOption === 'personal') return PERSONAL_DELIVERY_PRICE;
    if (deliveryOption === 'royalmail') return ROYAL_MAIL_PRICE;
    return 0;
  };

  const deliveryPrice = getDeliveryPrice();
  const total = subtotal + deliveryPrice;

  // Build order items list for email
  const buildItemsList = () => {
    let itemsList = '';

    items.forEach(item => {
      itemsList += `• ${item.name} x${item.quantity} - £${(item.price * item.quantity).toFixed(2)}\n`;
    });

    customItems.forEach(item => {
      itemsList += `• ${item.name} (${item.size.name}, ${item.size.numberOfRoses} roses) x${item.quantity} - £${item.totalPrice.toFixed(2)}\n`;
      if (item.addOns.length > 0) {
        itemsList += `  Add-ons: ${item.addOns.map(a => a.name).join(', ')}\n`;
      }
      Object.entries(item.addOnDetails).forEach(([id, detail]) => {
        const addOn = item.addOns.find(a => a._id === id);
        if (addOn && detail) {
          itemsList += `  ${addOn.name} details: ${detail}\n`;
        }
      });
    });

    return itemsList;
  };

  // Build full order summary for Instagram/fallback
  const buildOrderSummary = () => {
    let summary = `NEW ORDER from ${name}\n\n`;
    summary += `Contact: ${email} | ${phone}\n\n`;
    summary += `ITEMS:\n${buildItemsList()}`;
    summary += `\nDELIVERY: ${deliveryOption === 'collection' ? 'Collection' : deliveryOption === 'personal' ? 'Personal Delivery' : 'Royal Mail'}\n`;
    summary += `Delivery Date: ${formatDeliveryDate(deliveryDate)}\n`;
    if (deliveryOption !== 'collection') {
      summary += `Address: ${address}, ${postcode}\n`;
    }
    if (specialInstructions) {
      summary += `Special Instructions: ${specialInstructions}\n`;
    }
    summary += `\nSubtotal: £${subtotal.toFixed(2)}`;
    summary += `\nDelivery: £${deliveryPrice.toFixed(2)}`;
    summary += `\nTOTAL: £${total.toFixed(2)}`;

    return summary;
  };

  const getDeliveryMethodText = () => {
    if (deliveryOption === 'collection') return 'Collection';
    if (deliveryOption === 'personal') return 'Personal Delivery';
    return 'Royal Mail Delivery';
  };

  const handleEmailOrder = async () => {
    if (!canSubmit) return;

    setIsSendingEmail(true);
    setEmailError('');

    const orderNumber = `BB${Date.now().toString(36).toUpperCase()}`;
    const orderDate = new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Common template parameters
    const baseParams = {
      order_number: orderNumber,
      order_date: orderDate,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      items_list: buildItemsList(),
      delivery_method: getDeliveryMethodText(),
      delivery_date: formatDeliveryDate(deliveryDate),
      delivery_address: deliveryOption === 'collection' ? 'Collection from shop' : `${address}, ${postcode}`,
      special_instructions: specialInstructions || 'None',
      subtotal: `£${subtotal.toFixed(2)}`,
      delivery_cost: deliveryOption === 'collection' ? 'Free' : `£${deliveryPrice.toFixed(2)}`,
      total: `£${total.toFixed(2)}`,
      shop_email: SHOP_EMAIL,
    };

    try {
      // Send order notification to shop owner
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.ownerTemplateId,
        {
          ...baseParams,
          to_email: SHOP_EMAIL,
        },
        EMAILJS_CONFIG.publicKey
      );

      // Send confirmation email to customer
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.customerTemplateId,
        {
          ...baseParams,
          to_email: email,
          to_name: name,
        },
        EMAILJS_CONFIG.publicKey
      );

      setEmailSent(true);
    } catch (error) {
      console.error('Email send error:', error);
      setEmailError('Failed to send order. Please try again or use Instagram to place your order.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleInstagramOrder = () => {
    const message = encodeURIComponent(buildOrderSummary());
    // Instagram doesn't support pre-filled messages, so we'll copy to clipboard and redirect
    navigator.clipboard.writeText(buildOrderSummary()).then(() => {
      alert('Order details copied to clipboard! You will be redirected to Instagram. Please paste your order in a direct message.');
      window.open('https://instagram.com/thebespokebouquetco', '_blank');
    }).catch(() => {
      // Fallback - just open Instagram
      window.open('https://instagram.com/thebespokebouquetco', '_blank');
    });
  };

  const canSubmit = name && email && phone && acceptedTerms && deliveryOption && deliveryDate &&
    (deliveryOption === 'collection' || (address && postcode && isLocalDelivery !== null));

  const allItems = [...items, ...customItems];

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

                {/* Left Column - Contact & Delivery */}
                <div className="space-y-6">

                  {/* Contact Details */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <h3 className="font-serif text-xl text-stone-dark mb-4">Contact Details</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-stone-600 mb-1">Full Name *</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust"
                          placeholder="Your name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-stone-600 mb-1">Email *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-stone-600 mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust"
                          placeholder="07xxx xxxxxx"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-rose-dust" />
                      <h3 className="font-serif text-xl text-stone-dark">Delivery Address</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-stone-600 mb-1">Postcode *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={postcode}
                            onChange={(e) => {
                              setPostcode(e.target.value.toUpperCase());
                              setIsLocalDelivery(null);
                              setPostcodeError('');
                            }}
                            className="flex-1 px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust uppercase"
                            placeholder="e.g. SL4 3LR"
                          />
                          <button
                            onClick={checkPostcode}
                            disabled={isCheckingPostcode}
                            className="px-6 py-3 bg-stone-dark text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
                          >
                            {isCheckingPostcode ? 'Checking...' : 'Check'}
                          </button>
                        </div>
                        {postcodeError && (
                          <p className="text-red-500 text-sm mt-1">{postcodeError}</p>
                        )}
                      </div>

                      {isLocalDelivery !== null && (
                        <div>
                          <label className="block text-sm text-stone-600 mb-1">Address *</label>
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust resize-none"
                            rows={3}
                            placeholder="House number, street name, town/city"
                          />
                        </div>
                      )}
                    </div>

                    {/* Delivery Options */}
                    {isLocalDelivery !== null && (
                      <div className="mt-6">
                        <h4 className="font-serif text-lg text-stone-dark mb-3">Delivery Options</h4>

                        {isLocalDelivery ? (
                          <div className="space-y-3">
                            <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                              <Check className="w-4 h-4" />
                              Great news! You're within our local delivery area.
                            </p>

                            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              deliveryOption === 'personal' ? 'border-rose-dust bg-rose-dust/5' : 'border-stone-200 hover:border-stone-300'
                            }`}>
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryOption === 'personal'}
                                onChange={() => setDeliveryOption('personal')}
                                className="sr-only"
                              />
                              <Truck className="w-6 h-6 text-rose-dust" />
                              <div className="flex-1">
                                <p className="font-serif text-stone-dark">Personal Delivery</p>
                                <p className="text-sm text-stone-500">Hand-delivered to your door</p>
                              </div>
                              <span className="font-semibold text-stone-dark">£{PERSONAL_DELIVERY_PRICE}</span>
                            </label>

                            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              deliveryOption === 'collection' ? 'border-rose-dust bg-rose-dust/5' : 'border-stone-200 hover:border-stone-300'
                            }`}>
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryOption === 'collection'}
                                onChange={() => setDeliveryOption('collection')}
                                className="sr-only"
                              />
                              <Store className="w-6 h-6 text-rose-dust" />
                              <div className="flex-1">
                                <p className="font-serif text-stone-dark">Collection</p>
                                <p className="text-sm text-stone-500">Pick up from our location</p>
                              </div>
                              <span className="font-semibold text-green-700">Free</span>
                            </label>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Your location is outside our local delivery area. We'll send your order via Royal Mail.
                            </p>

                            <label className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              deliveryOption === 'royalmail' ? 'border-rose-dust bg-rose-dust/5' : 'border-stone-200 hover:border-stone-300'
                            }`}>
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryOption === 'royalmail'}
                                onChange={() => setDeliveryOption('royalmail')}
                                className="sr-only"
                              />
                              <Package className="w-6 h-6 text-rose-dust" />
                              <div className="flex-1">
                                <p className="font-serif text-stone-dark">Royal Mail Delivery</p>
                                <p className="text-sm text-stone-500">Delivered within 2-3 working days</p>
                              </div>
                              <span className="font-semibold text-stone-dark">£{ROYAL_MAIL_PRICE}</span>
                            </label>
                          </div>
                        )}

                        {/* Delivery Date */}
                        {deliveryOption && (
                          <div className="mt-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="w-5 h-5 text-rose-dust" />
                              <h4 className="font-serif text-lg text-stone-dark">
                                {deliveryOption === 'collection' ? 'Collection Date' : 'Delivery Date'}
                              </h4>
                            </div>
                            <div>
                              <label className="block text-sm text-stone-600 mb-1">
                                Select a date (at least 1 week from today) *
                              </label>
                              <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                min={getMinDeliveryDate()}
                                className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust"
                              />
                              {deliveryDate && (
                                <p className="text-sm text-rose-dust mt-2">
                                  {deliveryOption === 'collection' ? 'Collection' : 'Delivery'} on: {formatDeliveryDate(deliveryDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Special Instructions */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <h3 className="font-serif text-xl text-stone-dark mb-4">Special Instructions</h3>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:border-rose-dust resize-none"
                      rows={3}
                      placeholder="Any special requests or delivery instructions..."
                    />
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
                          onClick={(e) => { e.preventDefault(); setShowTerms(true); }}
                          className="text-rose-dust underline hover:text-stone-dark transition-colors"
                        >
                          Terms and Conditions
                        </button>
                      </span>
                    </label>
                  </div>

                  {/* FAQ Section */}
                  <div className="bg-cream-light/50 p-6 rounded-lg border border-stone-200">
                    <h3 className="font-serif text-xl text-stone-dark mb-4">Frequently Asked Questions</h3>
                    <div>
                      {FAQ_ITEMS.map((item, index) => (
                        <FAQAccordion
                          key={index}
                          item={item}
                          isOpen={openFAQ === index}
                          onToggle={() => setOpenFAQ(openFAQ === index ? null : index)}
                        />
                      ))}
                    </div>
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
                          <p className="font-medium text-stone-dark">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}

                      {customItems.map((item) => (
                        <div key={item._id} className="flex gap-3">
                          <div className="w-16 h-16 bg-stone-200 rounded overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-stone-dark">{item.name}</h4>
                            <p className="text-xs text-stone-500">{item.size.name} ({item.size.numberOfRoses} roses)</p>
                            {item.addOns.length > 0 && (
                              <p className="text-xs text-rose-dust">+ {item.addOns.map(a => a.name).join(', ')}</p>
                            )}
                            <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-stone-dark">£{item.totalPrice.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="border-t border-stone-300 pt-4 space-y-2">
                      <div className="flex justify-between text-stone-600">
                        <span>Subtotal</span>
                        <span className="font-medium">£{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Delivery</span>
                        <span className="font-medium">
                          {deliveryOption ? (deliveryOption === 'collection' ? 'Free' : `£${deliveryPrice.toFixed(2)}`) : 'Select option'}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-serif text-stone-dark pt-2 border-t border-stone-300">
                        <span>Total</span>
                        <span>£{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Email Success Screen */}
                    {emailSent ? (
                      <div className="mt-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                          </div>
                          <h4 className="font-serif text-xl text-green-800 mb-2">Order Submitted!</h4>
                          <p className="text-sm text-green-700 mb-4">
                            We've sent a confirmation email to <strong>{email}</strong>
                          </p>
                          <p className="text-xs text-green-600">
                            We'll be in touch shortly to confirm your order and arrange payment.
                          </p>
                        </div>
                        <button
                          onClick={onClose}
                          className="w-full mt-4 py-3 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-all duration-300 rounded-lg"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Validation Message */}
                        {!canSubmit && (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded border border-amber-200 mt-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-sm">Please fill in all required fields and accept the terms</p>
                          </div>
                        )}

                        {/* Email Error */}
                        {emailError && (
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded border border-red-200 mt-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-sm">{emailError}</p>
                          </div>
                        )}

                        {/* Order Buttons */}
                        <div className="mt-6 space-y-3">
                          <p className="text-sm text-stone-500 text-center mb-4">
                            Choose how you'd like to place your order:
                          </p>

                          <button
                            onClick={handleEmailOrder}
                            disabled={!canSubmit || isSendingEmail}
                            className="w-full py-4 bg-stone-dark text-white font-serif tracking-widest uppercase text-sm hover:bg-stone-800 transition-all duration-300 rounded-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSendingEmail ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending Order...
                              </>
                            ) : (
                              <>
                                <Mail className="w-5 h-5" />
                                Order via Email
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleInstagramOrder}
                            disabled={!canSubmit || isSendingEmail}
                            className="w-full py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-serif tracking-widest uppercase text-sm hover:opacity-90 transition-all duration-300 rounded-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Instagram className="w-5 h-5" />
                            Order via Instagram
                          </button>
                        </div>

                        <p className="text-xs text-stone-400 text-center mt-4">
                          We'll confirm your order and arrange payment separately
                        </p>
                      </>
                    )}
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
                    </p>

                    <h4>6. Contact</h4>
                    <p>
                      For any questions or concerns, please contact us via Instagram or email.
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
