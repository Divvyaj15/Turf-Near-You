
import { useToast } from '@/hooks/use-toast';

export const useAuthValidation = () => {
  const { toast } = useToast();

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - adjust regex as needed
    const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
    return phoneRegex.test(phone.trim());
  };

  const validateSignUpFields = (fullName: string): boolean => {
    if (!fullName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    validatePhoneNumber,
    validateSignUpFields
  };
};
