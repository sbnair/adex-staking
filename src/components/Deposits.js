import React, { useContext, useEffect, useState } from "react"
import {
	TableRow,
	TableCell,
	Box,
	Table,
	TableContainer,
	TableHead,
	TableBody
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import { DEPOSIT_POOLS } from "../helpers/constants"
import { formatADXPretty } from "../helpers/formatting"
import AppContext from "../AppContext"
import WithDialog from "./WithDialog"
import DepositForm from "./DepositForm"

const DepositsDialog = WithDialog(DepositForm)

const getLoyaltyPoolDeposit = (stats, chosenWalletType) => {
	const { loyaltyPoolStats } = stats
	return {
		poolId: "adex-loyalty-pool",
		label: "Loyalty Pool",
		balance: `
		${formatADXPretty(loyaltyPoolStats.balanceLpToken)} ADX-LOYALTY
		(= ${formatADXPretty(loyaltyPoolStats.balanceLpADX)} ADX)
		`,
		reward: `${
			loyaltyPoolStats.rewardADX
				? formatADXPretty(loyaltyPoolStats.rewardADX)
				: "Unknown"
		} ADX`,
		actions: [
			<DepositsDialog
				key="loyalty-pool-deposit-form"
				title="Add new deposit"
				btnLabel="Deposit"
				color="secondary"
				size="small"
				variant="contained"
				disabled={!chosenWalletType.name}
				depositPool={DEPOSIT_POOLS[0].id}
			/>,
			<DepositsDialog
				key="loyalty-pool-withdraw-form"
				title="Withdraw from loyalty pool"
				btnLabel="Withdraw"
				color="default"
				size="small"
				variant="contained"
				disabled={!chosenWalletType.name}
				depositPool={DEPOSIT_POOLS[0].id}
				withdraw
			/>
		]
	}
}

const updateDeposits = (deposits, newDeposit) => {
	const index = deposits.findIndex(x => x.poolId === newDeposit.poolId)
	const newDeposits = [...deposits]

	if (index > -1) {
		newDeposits[index] = newDeposit
	} else {
		newDeposits.push(newDeposit)
	}

	return newDeposits
}

export default function Deposits() {
	const [deposits, setDeposits] = useState([])

	const { stats, chosenWalletType } = useContext(AppContext)

	useEffect(() => {
		if (stats.loyaltyPoolStats.loaded) {
			const loyaltyPoolDeposit = getLoyaltyPoolDeposit(stats, chosenWalletType)
			setDeposits(updateDeposits(deposits, loyaltyPoolDeposit))
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stats])

	const renderDepositRow = deposit => {
		return (
			<TableRow key={deposit.poolId}>
				<TableCell>{deposit.label}</TableCell>
				<TableCell align="right">{deposit.balance}</TableCell>
				<TableCell align="right">{deposit.reward}</TableCell>
				<TableCell align="right">
					{deposit.actions.map((action, index) => (
						<Box key={index} display="inline-block" m={0.5}>
							{action}
						</Box>
					))}
				</TableCell>
			</TableRow>
		)
	}

	return (
		<Box>
			<Box>
				<DepositsDialog
					title="Add new deposit"
					btnLabel="New Deposit"
					color="secondary"
					size="large"
					variant="contained"
					disabled={!chosenWalletType.name}
				/>
			</Box>
			<Box>
				<TableContainer xs={12}>
					<Table aria-label="Bonds table">
						<TableHead>
							<TableRow>
								<TableCell>Pool</TableCell>
								<TableCell align="right">Balance</TableCell>
								<TableCell align="right">Reward</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>{[...(deposits || [])].map(renderDepositRow)}</TableBody>
					</Table>
				</TableContainer>
			</Box>
		</Box>
	)
}
