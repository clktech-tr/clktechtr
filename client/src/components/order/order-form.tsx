import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/types";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/types";
import { z } from "zod";
import { useEffect } from "react";

const orderFormSchema = z.object({
  customerName: z.string().nonempty("Ad soyad zorunlu"),
  email: z.string().email("Geçerli bir e-posta girin"),
  phone: z.string().nonempty("Telefon zorunlu"),
  address: z.string().nonempty("Adres zorunlu"),
  productId: z.number().min(1, "Ürün seçilmeli"),
  productName: z.string().nonempty("Ürün adı zorunlu"),
  price: z.object({
    tr: z.string().nonempty("Fiyat zorunlu"),
    en: z.string().nonempty("Fiyat zorunlu")
  }),
  notes: z.string().optional(),
  status: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderForm({ product, isOpen, onClose }: OrderFormProps) {
  console.log("OrderForm render", { product, isOpen });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      productId: product?.id || 0,
      productName: typeof product?.name === "string"
        ? product.name
        : ((product?.name as any)?.tr || (product?.name as any)?.en || ""),
      price: {
        tr: typeof product?.price === "object" && product?.price !== null ? ((product.price as any).tr || "") : (typeof product?.price === "string" ? product.price : ""),
        en: typeof product?.price === "object" && product?.price !== null ? ((product.price as any).en || "") : (typeof product?.price === "string" ? product.price : ""),
      },
      status: "pending",
    },
  });

  useEffect(() => {
    if (product && isOpen) {
      form.reset({
        customerName: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
        productId: product?.id || 0,
        productName: typeof product?.name === "string"
          ? product.name
          : ((product?.name as any)?.tr || (product?.name as any)?.en || ""),
        price: {
          tr: typeof product?.price === "object" && product?.price !== null ? ((product.price as any).tr || "") : (typeof product?.price === "string" ? product.price : ""),
          en: typeof product?.price === "object" && product?.price !== null ? ((product.price as any).en || "") : (typeof product?.price === "string" ? product.price : ""),
        },
        status: "pending",
      });
    }
  }, [product, isOpen]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (order) => {
      console.log("Order created successfully:", order);
      toast({
        title: "Order Submitted Successfully!",
        description: `Order ${order.orderId} has been created. You will receive bank transfer details via email.`,
      });
      
      // Get current admin orders from cache
      const currentOrders = queryClient.getQueryData(["/api/admin/orders"]) || [];
      console.log("Current orders in cache:", currentOrders);
      
      // Add the new order to the cache
      const updatedOrders = [order, ...(Array.isArray(currentOrders) ? currentOrders : [])];
      console.log("Updated orders:", updatedOrders);
      
      // Update the cache directly
      queryClient.setQueryData(["/api/admin/orders"], updatedOrders);
      
      // Also try to update the cache with a fresh fetch
      const token = localStorage.getItem("admin_token");
      if (token) {
        fetch("/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        })
        .then(res => res.json())
        .then(data => {
          console.log("Fresh admin orders data:", data);
          queryClient.setQueryData(["/api/admin/orders"], data);
        })
        .catch(err => console.error("Error fetching fresh orders:", err));
      }
      
      // Also invalidate other queries
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      
      // Force a refetch to ensure the UI updates
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/admin/orders"] });
        console.log("Forced refetch completed");
      }, 50);
      
      // Also try to trigger a global event
      window.dispatchEvent(new CustomEvent('orderCreated', { detail: order }));
      
      console.log("Cache updated and queries invalidated");
      
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to submit order. ${(error?.message || '')}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    console.log("onSubmit tetiklendi", data);
    createOrderMutation.mutate(data);
  };

  // Site ayarlarından banka bilgilerini çek
  const { data: settings } = useQuery<any>({ queryKey: ["/api/settings"] });

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold clk-text-black">
            Order via Bank Transfer
          </DialogTitle>
        </DialogHeader>
        
        <form
          onSubmit={e => {
            console.log("Form submit event!");
            form.handleSubmit(onSubmit)(e);
          }}
          className="space-y-6 mt-4 pb-8"
        >
          {/* Ürün bilgileri için hidden inputlar */}
          <input type="hidden" {...form.register("productId")} />
          <input type="hidden" {...form.register("productName")} />
          <input type="hidden" {...form.register("price.tr")} />
          <input type="hidden" {...form.register("price.en")} />
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customerName">Full Name</Label>
              <Input
                id="customerName"
                {...form.register("customerName")}
                className="mt-1"
              />
              {form.formState.errors.customerName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...form.register("phone")}
              className="mt-1"
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="address">Shipping Address</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              rows={3}
              className="mt-1"
            />
            {form.formState.errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              rows={3}
              className="mt-1"
              placeholder="Any special instructions or questions..."
            />
          </div>
          
          <div className="order-status p-4 rounded-lg" style={{background: 'linear-gradient(90deg, #facc15 0%, #f59e42 100%)', color: '#222'}}>
            <h3 className="font-semibold mb-2">Bank Transfer Information:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Bank:</strong> {settings?.bankName || 'CLK Bank'}</p>
              <p><strong>Account Number:</strong> {settings?.bankAccountNumber || '1234567890'}</p>
              <p><strong>IBAN:</strong> {settings?.bankIban || 'TR12 3456 7890 1234 5678 9012'}</p>
              <p><strong>Reference:</strong> {(settings?.bankReferencePrefix || 'Order #')}{product.name ? String(product.name) : ''}</p>
            </div>
          </div>
          
          {/* Sticky Submit Button */}
          <div style={{
            position: "sticky",
            bottom: 0,
            background: "white",
            padding: "1rem 0",
            zIndex: 10,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)"
          }}>
          <Button
            type="submit"
            className="btn-primary w-full py-3"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? "Submitting..." : "Submit Order"}
          </Button>
          </div>
        </form>
        {/* Validasyon hatalarını göster */}
      </DialogContent>
    </Dialog>
  );
}
