import { Routes } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { HomeComponent } from './home/home.component';
import { ClientComponent } from './client/client.component';
import { VehicleComponent } from './vehicle/vehicle.component';
import { VehiclesPageComponent } from './vehicles/vehicles.component';
import { ReservationComponent } from './reservation/reservation.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { PartsComponent } from './parts/parts.component';

export const routes: Routes = [
    {
        path:'',
        title: 'Home Page',
        component: HomeComponent
    },
    {
        path:'clients',
        title: 'Clients',
        component: ClientsComponent
    },
    {
        path:'clients/:id',
        title:'Client',
        component: ClientComponent,
    },
    {
        path:'vehicle-details/:vehicleId',
        title:'Vehicle',
        component: VehicleComponent
    },
    {
        path:'vehicles',
        title:'Vehicles',
        component: VehiclesPageComponent
    },
    {
        path:'reservations',
        title:'Reservations',
        component: ReservationsComponent
    },
    {
        path:'reservation/:reservationId',
        title:'Reservation',
        component: ReservationComponent
    },
    {
        path:'parts',
        title:'Parts',
        component: PartsComponent
    }
];
