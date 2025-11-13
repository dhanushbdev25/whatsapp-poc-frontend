import StatsHeader from './StatsHeader';
import OverviewCards from './/OverviewCards';
import SalesChart from './SalesChart';
import TopCustomersTable from './TopCustomersTable';

function index() {
    return (
        <>
            <StatsHeader></StatsHeader>
            <OverviewCards></OverviewCards>
            <SalesChart></SalesChart>
            <TopCustomersTable></TopCustomersTable>
        </>
    );
}

export default index;
