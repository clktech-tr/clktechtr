import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { OrderForm } from "@/components/order/order-form";
import type { Product } from "@shared/types";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);

  if (!product) return null;

  const specs = product.specs ? JSON.parse(product.specs) : {};

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold clk-text-black">
              {product.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid lg:grid-cols-2 gap-8 mt-4">
            <div>
              <img
                src={product.image}
                alt={product.name}
                className="w-full rounded-lg"
              />
            </div>
            
            <div>
              <div className="mb-6">
                <span className="text-3xl font-bold clk-text-orange">${product.price}</span>
                <Badge className="ml-4 product-badge">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
              
              <div className="tech-spec p-4 rounded-lg mb-6">
                <h3 className="font-semibold clk-text-black mb-3">Technical Specifications:</h3>
                <div className="space-y-2 text-sm font-mono">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span>{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{product.fullDescription}</p>
              
              <div className="space-y-4">
                <Button
                  className="btn-primary w-full py-3"
                  onClick={() => setShowOrderForm(true)}
                  disabled={!product.inStock}
                >
                  Buy via Bank Transfer
                </Button>
                
                <div className="flex space-x-4">
                  <Button variant="outline" className="btn-secondary flex-1">
                    Buy from Etsy
                  </Button>
                  <Button variant="outline" className="btn-secondary flex-1">
                    Buy from N11
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OrderForm
        product={product}
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
      />
    </>
  );
}
