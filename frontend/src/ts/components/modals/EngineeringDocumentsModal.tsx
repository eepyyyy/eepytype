import { createSignal, For, JSXElement, Setter } from "solid-js";

import { setCustomTextIndicator } from "../../states/core";
import { hideModal } from "../../states/modals";
import * as CustomText from "../../test/custom-text";
import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";
import { Separator } from "../common/Separator";

type CustomTextIncomingData =
  | ({ set?: boolean; long?: boolean } & (
      | { text: string; splitText?: never }
      | { text?: never; splitText: string[] }
    ))
  | null;

export type EngineeringDoc = {
  id: string;
  category: "aerospace" | "mechanical";
  title: string;
  subtitle: string;
  text: string;
};

export const engineeringDocuments: EngineeringDoc[] = [
  {
    id: "apollo-11-descent",
    category: "aerospace",
    title: "Apollo 11 Lunar Descent & AGC Guidance",
    subtitle: "MIT Instrumentation Lab & NASA Mission Audio Transcript",
    text: "The Apollo Guidance Computer was a digital computer produced for the Apollo program that was installed on board each Apollo command module and lunar module. It was one of the first computers to utilize silicon integrated circuits. The system operated in real time with cooperative multitasking through a priority-driven executive system called the EXEC, which scheduled computing routines based on urgency. When rendezvous radar data overloaded the computer during the Apollo 11 lunar descent, the 1202 and 1201 program alarms triggered core dump priority recovery, dropping low-priority telemetry tasks while continuously running critical guidance, navigation, and throttle control algorithms to ensure safe touchdown on the lunar regolith. Houston, Tranquility Base here. The Eagle has landed.",
  },
  {
    id: "aerodynamics-boundary-layer",
    category: "aerospace",
    title: "Prandtl Boundary Layer & Flow Dynamics",
    subtitle: "Fluid mechanics & aerodynamic stall prevention",
    text: "The boundary layer is the thin layer of fluid adjacent to a bounding surface where the effects of viscosity are significant. As flow moves downstream over an aerodynamic airfoil, transition from laminar to turbulent flow alters surface skin-friction drag. Maintaining attached flow and delaying boundary layer separation prevents aerodynamic stall at high angles of attack. Bernoulli's principle combined with the circulation theorem explains how cambered airfoils generate aerodynamic lift through net circulation and differential pressure gradients across upper and lower lifting surfaces.",
  },
  {
    id: "rocket-propulsion-orbital",
    category: "aerospace",
    title: "Rocket Propulsion & Orbital Mechanics",
    subtitle: "Tsiolkovsky rocket equation & Hohmann transfers",
    text: "The Tsiolkovsky rocket equation dictates that the velocity change of a spacecraft is proportional to the effective exhaust velocity and the natural logarithm of the initial to final mass ratio. Orbital mechanics governs the trajectories of artificial satellites and interplanetary spacecraft through celestial mechanics. A Hohmann transfer orbit represents the most fuel-efficient elliptical trajectory to transfer between two coplanar circular orbits, requiring two instantaneous velocity impulses applied tangentially at periapsis and apoapsis.",
  },
  {
    id: "hypersonic-aerothermodynamics",
    category: "aerospace",
    title: "Hypersonic Aerothermodynamics & Re-entry",
    subtitle: "Shock layers, high-enthalpy gases & thermal protection",
    text: "Hypersonic flight occurs at speeds exceeding Mach 5, where high-temperature shock layers induce chemical dissociation of atmospheric gases. Vehicle aerothermodynamics must manage intense convective and radiative heating through ablative or reusable ceramic tile thermal protection systems. The interaction between shock waves and boundary layers creates localized peak pressure gradients and aerodynamic heating that dictate structural design limits for lifting body re-entry vehicles.",
  },
  {
    id: "laws-of-thermodynamics",
    category: "mechanical",
    title: "The Four Laws of Thermodynamics",
    subtitle: "Energy conservation, entropy, & heat engine cycles",
    text: "The Zeroth Law establishes thermal equilibrium and temperature measurement. The First Law states that energy can neither be created nor destroyed, only transformed from one form to another, establishing the conservation of internal energy, heat transfer, and boundary work. The Second Law asserts that the total entropy of an isolated system always increases over time, dictating the irreversibility of natural processes and establishing the maximum theoretical efficiency limit defined by the Carnot cycle. The Third Law states that the entropy of a pure crystalline substance approaches zero as temperature approaches absolute zero.",
  },
  {
    id: "navier-stokes-momentum",
    category: "mechanical",
    title: "Navier-Stokes Equations & Viscous Fluid Flow",
    subtitle: "Continuity, momentum balance, & turbulent shear stress",
    text: "The Navier-Stokes equations describe how the velocity, pressure, temperature, and density of a moving fluid are related. Derived by applying Newton's second law alongside Cauchy's stress tensor to fluid motion, they account for viscosity, pressure forces, and convective acceleration in both laminar and turbulent regimes. Reynolds numbers categorize flow regimes, predicting transition points where viscous damping yields to inertial instabilities and vortex shedding.",
  },
  {
    id: "mohr-circle-fracture-mechanics",
    category: "mechanical",
    title: "Stress Tensors, Mohr's Circle & Fracture",
    subtitle: "Principal stress transformation, fatigue & crack propagation",
    text: "Mohr's circle is a graphical representation of the transformation equations for plane stress and plane strain problems. By plotting normal stress on the horizontal axis and shear stress on the vertical axis, engineers determine principal stresses, maximum in-plane shear stress, and orientation of the principal planes. Fatigue failure in mechanical components occurs under repeated cyclic loading at stress levels significantly lower than ultimate tensile strength, with subcritical crack propagation governed by Paris' law.",
  },
  {
    id: "kinematic-synthesis-mechanisms",
    category: "mechanical",
    title: "Kinematic Synthesis of Mechanisms",
    subtitle: "Four-bar linkages, cams, & hydrodynamic bearings",
    text: "Kinematic synthesis of planar mechanisms involves designing four-bar linkages, slider-crank configurations, and cam-follower assemblies to generate specified path motions and torque transfers. According to Grashof's theorem, continuous rotational motion can occur if the sum of shortest and longest link lengths is less than or equal to the sum of the remaining two link lengths. Dynamic force balancing of reciprocating masses minimizes vibration transmission into machine foundations, while lubricating oil films governed by Reynolds' hydrodynamic equation prevent metal-to-metal contact in journal bearings.",
  },
];

export function EngineeringDocumentsModal(props: {
  setChainedData: Setter<CustomTextIncomingData>;
}): JSXElement {
  const [selectedCategory, setSelectedCategory] = createSignal<
    "all" | "aerospace" | "mechanical"
  >("all");

  const filteredDocs = () => {
    const cat = selectedCategory();
    if (cat === "all") return engineeringDocuments;
    return engineeringDocuments.filter((doc) => doc.category === cat);
  };

  const handleSelectDoc = (doc: EngineeringDoc) => {
    // Save to custom text long storage so progress is saved
    CustomText.setCustomText(doc.title, doc.text, true);
    setCustomTextIndicator({ name: doc.title, isLong: true });
    props.setChainedData({ text: doc.text, long: true });
    hideModal("EngineeringDocuments");
  };

  return (
    <AnimatedModal
      id="EngineeringDocuments"
      title="Engineering Documents"
      modalClass="max-w-[700px]"
    >
      <div class="mb-3 flex items-center gap-2">
        <Button
          variant="button"
          text="all"
          active={selectedCategory() === "all"}
          onClick={() => setSelectedCategory("all")}
        />
        <Button
          variant="button"
          text="aerospace"
          active={selectedCategory() === "aerospace"}
          onClick={() => setSelectedCategory("aerospace")}
        />
        <Button
          variant="button"
          text="mechanical"
          active={selectedCategory() === "mechanical"}
          onClick={() => setSelectedCategory("mechanical")}
        />
      </div>

      <div class="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
        <For each={filteredDocs()}>
          {(doc) => {
            const wordCount = doc.text.split(/\s+/).length;
            return (
              <div class="flex flex-col gap-1 rounded bg-sub-alt p-3 transition hover:bg-sub-alt/80">
                <div class="flex items-center justify-between">
                  <div class="font-bold text-main">{doc.title}</div>
                  <span class="rounded bg-sub/20 px-2 py-0.5 text-xs text-sub">
                    {doc.category} · {wordCount} words
                  </span>
                </div>
                <div class="text-xs text-sub">{doc.subtitle}</div>
                <div class="my-1 line-clamp-2 text-xs text-text/80">
                  {doc.text}
                </div>
                <div class="mt-1 flex justify-end">
                  <Button
                    variant="button"
                    text="type this document"
                    fa={{ icon: "fa-keyboard", fixedWidth: true }}
                    class="text-xs"
                    onClick={() => handleSelectDoc(doc)}
                  />
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <Separator />

      <div class="text-xs text-sub">
        Selecting a document loads it into Monkeytype&apos;s native custom text
        mode with full progress tracking, allowing you to practice complete
        technical articles.
      </div>
    </AnimatedModal>
  );
}
