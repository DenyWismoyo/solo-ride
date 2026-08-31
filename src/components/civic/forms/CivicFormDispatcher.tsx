"use client";

import React from "react";
import { SectorDefinition } from "@/constants/ecosystemSectors";
import { AppService } from "@/constants/services";

// 1. Dukcapil Forms
import { DukcapilAntarKtpForm } from "./dukcapil/DukcapilAntarKtpForm";
import { DukcapilKiaAkteForm } from "./dukcapil/DukcapilKiaAkteForm";
import { DukcapilMobilePerekamanForm } from "./dukcapil/DukcapilMobilePerekamanForm";

// 2. Dinsos Forms
import { DinsosBansosSembakoForm } from "./dinsos/DinsosBansosSembakoForm";
import { DinsosOjekDifabelForm } from "./dinsos/DinsosOjekDifabelForm";
import { DinsosTanggapBencanaForm } from "./dinsos/DinsosTanggapBencanaForm";

// 3. Dinkes Forms
import { DinkesResepObatForm } from "./dinkes/DinkesResepObatForm";
import { DinkesProlanisForm } from "./dinkes/DinkesProlanisForm";
import { DinkesDonorDarahForm } from "./dinkes/DinkesDonorDarahForm";

// 4. Diskop Forms
import { DiskopLegalitasNibForm } from "./diskop/DiskopLegalitasNibForm";
import { DiskopDanaBergulirForm } from "./diskop/DiskopDanaBergulirForm";

// 5. Dishub Forms
import { DishubCfdShelterView } from "./dishub/DishubCfdShelterView";
import { DishubBookingKirForm } from "./dishub/DishubBookingKirForm";
import { DishubLaporLalinForm } from "./dishub/DishubLaporLalinForm";

// 6. Bapenda Forms
import { BapendaPbbForm } from "./bapenda/BapendaPbbForm";
import { BapendaRetribusiPasarForm } from "./bapenda/BapendaRetribusiPasarForm";
import { BapendaKonsultasiPajakForm } from "./bapenda/BapendaKonsultasiPajakForm";

// 7. Damkar Forms
import { DamkarPanicDispatchForm } from "./damkar/DamkarPanicDispatchForm";

// 8. DLH Forms
import { DlhBankSampahForm } from "./dlh/DlhBankSampahForm";
import { DlhLaporPohonForm } from "./dlh/DlhLaporPohonForm";

// 9. Disdik Forms
import { DisdikAntarSekolahForm } from "./disdik/DisdikAntarSekolahForm";
import { DisdikAntarIjazahForm } from "./disdik/DisdikAntarIjazahForm";

// 10. Dispusip Forms
import { DispusipKurirBukuForm } from "./dispusip/DispusipKurirBukuForm";

// 11. Disnaker Forms
import { DisnakerKartuKuningForm } from "./disnaker/DisnakerKartuKuningForm";
import { DisnakerPelatihanBlkForm } from "./disnaker/DisnakerPelatihanBlkForm";

// 12. Diskominfo Forms
import { DiskominfoUlasForm } from "./diskominfo/DiskominfoUlasForm";

// 13. Satpol PP Forms
import { SatpolppTrantibForm } from "./satpolpp/SatpolppTrantibForm";

// 14. DPMPTSP Forms
import { DpmptspMppIzinForm } from "./dpmptsp/DpmptspMppIzinForm";

// 15. DP3A Forms
import { Dp3aSapa129Form } from "./dp3a/Dp3aSapa129Form";

// 16. Dispertan Forms
import { DispertanPuskeswanForm } from "./dispertan/DispertanPuskeswanForm";

// 17. Dispar Forms
import { DisparHeritageTourForm } from "./dispar/DisparHeritageTourForm";

// 18. BPBD Forms
import { BpbdLaporBanjirForm } from "./bpbd/BpbdLaporBanjirForm";

interface CivicFormDispatcherProps {
  agency: SectorDefinition;
  service: AppService;
  onSuccess: (orderId: string, otpCode?: string) => void;
  onCancel: () => void;
}

export function CivicFormDispatcher({
  agency,
  service,
  onSuccess,
  onCancel
}: CivicFormDispatcherProps) {
  const serviceId = service.id;

  // 1. Dukcapil
  if (serviceId === "dukcapil_antar_ktp") {
    return <DukcapilAntarKtpForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dukcapil_kia_akte") {
    return <DukcapilKiaAkteForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dukcapil_mobile_perekaman") {
    return <DukcapilMobilePerekamanForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 2. Dinsos
  if (serviceId === "dinsos_bansos_pasar") {
    return <DinsosBansosSembakoForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dinsos_ojek_difabel") {
    return <DinsosOjekDifabelForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dinsos_tanggap_bencana") {
    return <DinsosTanggapBencanaForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 3. Dinkes
  if (serviceId === "dinkes_resep_puskesmas") {
    return <DinkesResepObatForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dinkes_prolanis") {
    return <DinkesProlanisForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dinkes_donor_darah") {
    return <DinkesDonorDarahForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 4. Diskop
  if (serviceId === "diskop_legalitas_nib") {
    return <DiskopLegalitasNibForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "diskop_dana_bergulir") {
    return <DiskopDanaBergulirForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 5. Dishub
  if (serviceId === "dishub_cfd_shelter" || serviceId === "dishub_peta_shelter_cfd") {
    return <DishubCfdShelterView agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dishub_booking_uji_kir") {
    return <DishubBookingKirForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dishub_lapor_jalan" || serviceId === "dishub_lapor_lalin") {
    return <DishubLaporLalinForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 6. Bapenda
  if (serviceId === "bapenda_pbb") {
    return <BapendaPbbForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "bapenda_retribusi_pasar") {
    return <BapendaRetribusiPasarForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "bapenda_konsultasi_pajak") {
    return <BapendaKonsultasiPajakForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 7. Damkar
  if (serviceId.includes("damkar") || serviceId.includes("panic")) {
    return <DamkarPanicDispatchForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 8. DLH
  if (serviceId === "dlh_jemput_sampah_daur_ulang" || serviceId.includes("sampah")) {
    return <DlhBankSampahForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "dlh_lapor_pohon_tumbang" || serviceId.includes("pohon")) {
    return <DlhLaporPohonForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 9. Disdik
  if (serviceId === "disdik_antar_ijazah_buku") {
    return <DisdikAntarIjazahForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId.includes("disdik") || serviceId.includes("sekolah")) {
    return <DisdikAntarSekolahForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 10. Dispusip
  if (serviceId.includes("dispusip") || serviceId.includes("buku")) {
    return <DispusipKurirBukuForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 11. Disnaker
  if (serviceId === "disnaker_kartu_kuning_ak1") {
    return <DisnakerKartuKuningForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }
  if (serviceId === "disnaker_pelatihan_blk") {
    return <DisnakerPelatihanBlkForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 12. Diskominfo
  if (serviceId.includes("diskominfo") || serviceId.includes("ulas")) {
    return <DiskominfoUlasForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 13. Satpol PP
  if (serviceId.includes("satpolpp") || serviceId.includes("trantib")) {
    return <SatpolppTrantibForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 14. DPMPTSP
  if (serviceId.includes("dpmptsp") || serviceId.includes("mpp")) {
    return <DpmptspMppIzinForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 15. DP3A
  if (serviceId.includes("dp3a") || serviceId.includes("sapa")) {
    return <Dp3aSapa129Form agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 16. Dispertan
  if (serviceId.includes("dispertan") || serviceId.includes("puskeswan")) {
    return <DispertanPuskeswanForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 17. Dispar
  if (serviceId.includes("dispar") || serviceId.includes("heritage")) {
    return <DisparHeritageTourForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // 18. BPBD
  if (serviceId.includes("bpbd") || serviceId.includes("banjir")) {
    return <BpbdLaporBanjirForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  // Fallback to Dukcapil Antar KTP Form as safe default
  return <DukcapilAntarKtpForm agency={agency} service={service} onSuccess={onSuccess} onCancel={onCancel} />;
}
