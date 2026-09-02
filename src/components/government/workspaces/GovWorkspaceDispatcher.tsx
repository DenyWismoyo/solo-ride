"use client";

import React from "react";
import { OrderDocument } from "@/types/order.types";

// Modular Dinas Workspaces
import { DukcapilWorkspace } from "./dukcapil/DukcapilWorkspace";
import { DinsosWorkspace } from "./dinsos/DinsosWorkspace";
import { DinkesWorkspace } from "./dinkes/DinkesWorkspace";
import { DiskopWorkspace } from "./diskop/DiskopWorkspace";
import { DisparWorkspace } from "./dispar/DisparWorkspace";
import { DishubWorkspace } from "./dishub/DishubWorkspace";
import { BapendaWorkspace } from "./bapenda/BapendaWorkspace";
import { DamkarWorkspace } from "./damkar/DamkarWorkspace";
import { BpbdWorkspace } from "./bpbd/BpbdWorkspace";
import { Dp3aWorkspace } from "./dp3a/Dp3aWorkspace";
import { DlhWorkspace } from "./dlh/DlhWorkspace";
import { DisdikWorkspace } from "./disdik/DisdikWorkspace";
import { DispusipWorkspace } from "./dispusip/DispusipWorkspace";
import { DispertanWorkspace } from "./dispertan/DispertanWorkspace";
import { DisnakerWorkspace } from "./disnaker/DisnakerWorkspace";
import { DiskominfoWorkspace } from "./diskominfo/DiskominfoWorkspace";
import { SatpolppWorkspace } from "./satpolpp/SatpolppWorkspace";
import { DpmptspWorkspace } from "./dpmptsp/DpmptspWorkspace";
import { DisdagWorkspace } from "./disdag/DisdagWorkspace";

interface GovWorkspaceDispatcherProps {
  dinasId: string;
  orders: OrderDocument[];
  loading: boolean;
}

export function GovWorkspaceDispatcher({
  dinasId,
  orders,
  loading
}: GovWorkspaceDispatcherProps) {
  const normalizedId = dinasId.startsWith("gov_") ? dinasId : `gov_${dinasId}`;

  switch (normalizedId) {
    case "gov_dukcapil":
      return <DukcapilWorkspace orders={orders} loading={loading} />;
    case "gov_dinsos":
      return <DinsosWorkspace orders={orders} loading={loading} />;
    case "gov_dinkes":
      return <DinkesWorkspace orders={orders} loading={loading} />;
    case "gov_diskop":
      return <DiskopWorkspace orders={orders} loading={loading} />;
    case "gov_disdag":
      return <DisdagWorkspace orders={orders} loading={loading} />;
    case "gov_dispar":
      return <DisparWorkspace orders={orders} loading={loading} />;
    case "gov_dishub":
      return <DishubWorkspace orders={orders} loading={loading} />;
    case "gov_bapenda":
      return <BapendaWorkspace orders={orders} loading={loading} />;
    case "gov_damkar":
      return <DamkarWorkspace orders={orders} loading={loading} />;
    case "gov_bpbd":
      return <BpbdWorkspace orders={orders} loading={loading} />;
    case "gov_dp3a":
      return <Dp3aWorkspace orders={orders} loading={loading} />;
    case "gov_dlh":
      return <DlhWorkspace orders={orders} loading={loading} />;
    case "gov_disdik":
      return <DisdikWorkspace orders={orders} loading={loading} />;
    case "gov_dispusip":
      return <DispusipWorkspace orders={orders} loading={loading} />;
    case "gov_dispertan":
      return <DispertanWorkspace orders={orders} loading={loading} />;
    case "gov_disnaker":
      return <DisnakerWorkspace orders={orders} loading={loading} />;
    case "gov_diskominfo":
      return <DiskominfoWorkspace orders={orders} loading={loading} />;
    case "gov_satpolpp":
      return <SatpolppWorkspace orders={orders} loading={loading} />;
    case "gov_dpmptsp":
      return <DpmptspWorkspace orders={orders} loading={loading} />;
    default:
      return <DukcapilWorkspace orders={orders} loading={loading} />;
  }
}
