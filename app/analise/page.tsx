"use client";

import { ProtectedPage } from "@/components/ProtectedPage";

export default function AnalisePage() {
  return (
    <ProtectedPage permissionKey="EXTERNO">
      <div className="container mx-auto py-8 px-4">
        <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="100%"
            src="https://lookerstudio.google.com/embed/reporting/920ccd7b-d042-4872-aa11-7256c0783f59/page/MQCvE"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          ></iframe>
        </div>
      </div>
    </ProtectedPage>
  );
}
