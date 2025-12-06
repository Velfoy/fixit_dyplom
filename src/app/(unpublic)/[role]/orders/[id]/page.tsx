import { OrderDetailView } from "@/components/pages/OrderDetailView";
import { getCachedSession } from "@/lib/session";
import { Order, ServiceOrders, Task } from "@/types/serviceorders";

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderPage(props: OrderPageProps) {
  const session = await getCachedSession();
  const { id: orderId } = await props.params;
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/orders/${orderId}`,
      {
        cache: "no-store",
      }
    );
    // const dataServiceOrder: ServiceOrders = res.ok ? await res.json() : [];
    // Mock Tasks
    const mockTasks: Task[] = [
      {
        id: 1,
        mechanicFirstName: "Mike",
        mechanicLastName: "Johnson",
        title: "Engine Diagnostic",
        description:
          "Performed complete engine diagnostic to identify all issues.",
        status: "DONE",
        created_at: "2025-11-10T09:00:00Z",
        updated_at: "2025-11-11T12:00:00Z",
        priority: "HIGH",
      },
      {
        id: 2,
        mechanicFirstName: "Mike",
        mechanicLastName: "Johnson",
        title: "Oil Pump Replacement",
        description:
          "Replaced the oil pump and performed routine oil change. Replaced the oil pump and performed routine oil change",
        status: "DONE",
        created_at: "2025-11-11T10:00:00Z",
        updated_at: "2025-11-12T14:00:00Z",
        priority: "NORMAL",
      },
      {
        id: 3,
        mechanicFirstName: "Mike",
        mechanicLastName: "Johnson",
        title: "Timing Belt Replacement",
        description: "Replaced timing belt according to manufacturer specs.",
        status: "IN_PROGRESS",
        created_at: "2025-11-12T08:30:00Z",
        updated_at: "2025-11-12T15:00:00Z",
        priority: "HIGH",
      },
      {
        id: 4,
        mechanicFirstName: "Mike",
        mechanicLastName: "Johnson",
        title: "Brake System Check",
        description:
          "Checked brakes, replaced worn pads, and tested braking efficiency.",
        status: "PENDING",
        created_at: "2025-11-12T09:00:00Z",
        updated_at: "2025-11-12T09:00:00Z",
        priority: "NORMAL",
      },
      {
        id: 5,
        mechanicFirstName: "Mike",
        mechanicLastName: "Johnson",
        title: "Fluid Levels Inspection",
        description: "Checked all fluids and topped up as necessary.",
        status: "BLOCKED",
        created_at: "2025-11-12T09:30:00Z",
        updated_at: "2025-11-12T09:30:00Z",
        priority: "LOW",
      },
    ];

    const dataServiceOrder: Order = {
      id: Number(orderId),
      orderNumber: "ORD-2025-0001",
      carBrand: "Porsche",
      carModel: "911 Carrera",
      carYear: "2023",
      carLicensePlate: "BT5674BU",
      issue: "Engine repair and oil change",
      description:
        "Complete engine diagnostic performed. Timing belt and oil pump replaced. Routine oil change included. Complete engine diagnostic performed. Timing belt and oil pump replaced. Routine oil change included.",
      status: "COMPLETED",

      endDate: "2025-11-15",
      total_cost: 850,
      progress: 60,
      priority: "HIGH",
      mechanicFirstName: "Mike",
      mechanicLastName: "Johnson",
      mechanicEmail: "mike.johnson@fixitgarage.com",
      mechanicPhone: "+1-555-930-1290",
      task: mockTasks,
    };

    return (
      <OrderDetailView dataServiceOrder={dataServiceOrder} session={session} />
    );
  } catch (error) {
    console.error(error);
    return <OrderDetailView session={session} />;
  }
}
