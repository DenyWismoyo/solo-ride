"use client";

import React, { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GOVERNMENT_SECTORS, SectorDefinition } from "@/constants/ecosystemSectors";
import { ALL_ECOSYSTEM_SERVICES, AppService } from "@/constants/services";
import { CivicPageLayout } from "@/components/civic/shared/CivicPageLayout";
import { CivicFormDispatcher } from "@/components/civic/forms/CivicFormDispatcher";

interface SubServicePageProps {
  params: Promise<{
    id: string;
    serviceId: string;
  }>;
}

export default function SubServicePage({ params }: SubServicePageProps) {
  const { id, serviceId } = use(params);
  const router = useRouter();

  const normalizedAgencyId = id.startsWith("gov_") ? id : `gov_${id}`;
  const agencyMeta: SectorDefinition = useMemo(() => {
    return (
      GOVERNMENT_SECTORS.find((s) => s.id === normalizedAgencyId || s.id === id) || {
        id: normalizedAgencyId,
        parentRole: "government",
        name: "Dinas Pemkot Solo",
        agencyOrCompanyName: "Pemerintah Kota Surakarta",
        tagline: "Pelayanan Publik Terintegrasi Warga Surakarta",
        avatar: "🏛️",
        accentColor: "blue",
        services: [],
        sampleFeatures: [],
        description: "Pusat Layanan Warga Pemerintah Kota Surakarta"
      }
    );
  }, [normalizedAgencyId, id]);

  const serviceMeta: AppService = useMemo(() => {
    return (
      ALL_ECOSYSTEM_SERVICES.find((s) => s.id === serviceId) || {
        id: serviceId,
        name: serviceId.replace(/_/g, " ").toUpperCase(),
        shortName: serviceId,
        description: "Pelayanan Publik Resmi Pemkot Surakarta",
        icon: null,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        isAvailable: true,
        category: "government" as const,
        feeLabel: "Resmi Pemkot Solo",
        agencyName: agencyMeta.name
      }
    );
  }, [serviceId, agencyMeta]);

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);

  const handleSuccess = (orderId: string, otp?: string) => {
    setCreatedOrderId(orderId);
    if (otp) setOtpCode(otp);
  };

  const handleReset = () => {
    setCreatedOrderId(null);
    setOtpCode(null);
  };

  const handleCancel = () => {
    router.push(`/services/gov/${agencyMeta.id}`);
  };

  return (
    <CivicPageLayout
      agencyId={agencyMeta.id}
      agencyName={agencyMeta.name}
      agencyAvatar={agencyMeta.avatar}
      serviceTitle={serviceMeta.name}
      serviceDescription={serviceMeta.description}
      feeLabel={serviceMeta.feeLabel}
      createdOrderId={createdOrderId}
      otpCode={otpCode}
      onReset={handleReset}
    >
      <CivicFormDispatcher
        agency={agencyMeta}
        service={serviceMeta}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </CivicPageLayout>
  );
}
