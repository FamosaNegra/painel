"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import { permissions, PermissionKey } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProtectedPageProps {
  permissionKey: PermissionKey;
  children: ReactNode;
}

export function ProtectedPage({ permissionKey, children }: ProtectedPageProps) {
  const { metadata } = useUserStore();
  const router = useRouter();
  const allowedPermissions = permissions[permissionKey];
  const userPermission = metadata?.permission as PermissionKey;
  const [checkingPermission, setCheckingPermission] = useState(true);

  useEffect(() => {
    if (!userPermission) return;

    if (!allowedPermissions.includes(userPermission)) {
      router.replace("/unauthorized");
    } else {
      setCheckingPermission(false);
    }
  }, [userPermission, allowedPermissions, router]);

  return (
    <>
      <AnimatePresence>
        {checkingPermission && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-[50vh]"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {!checkingPermission && children}
    </>
  );
}
