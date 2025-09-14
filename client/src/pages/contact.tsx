import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Zod şeması doğrudan burada tanımlanıyor
const contactFormSchema = z.object({
  firstName: z.string().min(2, "Ad gerekli"),
  lastName: z.string().min(2, "Soyad gerekli"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  subject: z.string().min(2, "Konu gerekli"),
  message: z.string().min(5, "Mesaj gerekli"),
  captchaAnswer: z.number().int(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: "", answer: 0 });

  // Generate random math question for CAPTCHA
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    let question = "";
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '*':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
    }
    
    setCaptchaQuestion({ question, answer });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
      captchaAnswer: 0,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
      generateCaptcha(); // Generate new CAPTCHA after successful submission
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    // Validate CAPTCHA answer
    if (data.captchaAnswer !== captchaQuestion.answer) {
      form.setError("captchaAnswer", {
        type: "manual",
        message: "Incorrect answer. Please try again.",
      });
      generateCaptcha();
      return;
    }
    
    contactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{backgroundColor:'#f8fafc'}}>
      {/* SVG Grid Pattern BG */}
      <svg className="absolute inset-0 w-full h-full opacity-20 z-0" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="20" height="20" fill="#f8fafc" />
            <circle cx="1" cy="1" r="1" fill="#e5e7eb" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#374151] mb-4">
            {t("contact.title")}
          </h1>
          <p className="text-xl text-[#374151] max-w-3xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="shadow-xl border-none bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[#374151]">
                {t("contact.form.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">{t("contact.form.firstName")}</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                      className="mt-1"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">{t("contact.form.lastName")}</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                      className="mt-1"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">{t("contact.form.email")}</Label>
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

                <div>
                  <Label htmlFor="subject">{t("contact.form.subject")}</Label>
                  <Select onValueChange={(value) => form.setValue("subject", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t("contact.form.subjectPlaceholder")}/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">{t("contact.form.subjectOptions.technical")}</SelectItem>
                      <SelectItem value="sales">{t("contact.form.subjectOptions.sales")}</SelectItem>
                      <SelectItem value="general">{t("contact.form.subjectOptions.general")}</SelectItem>
                      <SelectItem value="partnership">{t("contact.form.subjectOptions.partnership")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="message">{t("contact.form.message")}</Label>
                  <Textarea
                    id="message"
                    {...form.register("message")}
                    rows={5}
                    className="mt-1"
                  />
                  {form.formState.errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                {/* Math CAPTCHA */}
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                  <Label htmlFor="captchaAnswer" className="text-sm font-medium">
                    {t("contact.form.captchaLabel", { question: captchaQuestion.question })}
                  </Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input
                      id="captchaAnswer"
                      type="number"
                      {...form.register("captchaAnswer", { valueAsNumber: true })}
                      placeholder={t("contact.form.captchaPlaceholder")}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={generateCaptcha}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {t("contact.form.newQuestion")}
                    </Button>
                  </div>
                  {form.formState.errors.captchaAnswer && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.captchaAnswer.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#f59e42] to-[#34d399] text-white font-semibold rounded-lg shadow hover:scale-105 transition-all duration-200"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? t("contact.form.sending") : t("contact.form.send")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="shadow-md border-none bg-white/90">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-[#374151]">
                  {t("contact.info.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-gradient-to-br from-[#f59e42] to-[#34d399] shadow">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#374151] mb-1">{t("contact.info.email")}</h4>
                    <p className="text-[#374151]">clktechtr@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-gradient-to-br from-[#34d399] to-[#f59e42] shadow">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#374151] mb-1">{t("contact.info.phone")}</h4>
                    <p className="text-[#374151]">+905373455453</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-gradient-to-br from-[#f59e42] to-[#34d399] shadow">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#374151] mb-1">{t("contact.info.address")}</h4>
                    <p className="text-[#374151]">
                      Merkez / KONYA 42100
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-gradient-to-br from-[#34d399] to-[#f59e42] shadow">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#374151] mb-1">{t("contact.info.businessHours")}</h4>
                    <p className="text-[#374151]">{t("contact.info.businessHoursWeek")}</p>
                    <p className="text-[#374151]">{t("contact.info.businessHoursSat")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="shadow-md border-none bg-white/90">
              <CardContent className="p-6">
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-[#374151]">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-[#f59e42]" />
                    <p className="font-semibold">{t("contact.info.mapCity")}</p>
                    <p className="text-sm">{t("contact.info.mapDesc")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div style={{ height: '48px' }} />
    </div>
  );
}
