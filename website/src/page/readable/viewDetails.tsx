// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import "@cloudscape-design/global-styles/index.css";

import React from "react";
import { useTranslation } from "react-i18next";

import {
	ButtonGroup,
	Header,
	Input,
	Table,
} from "@cloudscape-design/components";

import { generateClient } from "@aws-amplify/api";

import { formatJobNameId } from "../../util/formatJobNameId";
import { formatTimestamp } from "../../util/formatTimestamp";

const client = generateClient({ authMode: "userPool" });

const features = require("../../features.json");
let readableUpdateJobMetadata = null;
if (features.readable) {
	readableUpdateJobMetadata =
		require("../../graphql/mutations").readableUpdateJobMetadata;
}

export default function ReadableViewDetails(props) {
	const { t } = useTranslation();

	async function saveJobNameToDb() {
		try {
			await client.graphql({
				query: readableUpdateJobMetadata,
				variables: {
					id: props.metadataState.id,
					name: props.metadataState.name,
				},
			});
		} catch (error) {
			console.error(error);
			console.error("ERROR: " + error.errors[0].message);
		}
	}

	function updateJobName(e, setValue) {
		setValue(e.detail.value);
		props.setMetadataState((currentState) => {
			const newState = { ...currentState };
			newState.name = e.detail.value;
			return newState;
		});
	}

	function copyStringToClipboard(str: string) {
		navigator.clipboard.writeText(str);
	}

	interface ItemClickDetails {
		checked?: boolean;
		id: string;
		pressed?: boolean;
	}

	function handleButtonGroup(
		detail: ItemClickDetails,
		itemId: string,
		index: number
	) {
		switch (detail.id) {
			case "copy-itemId":
				copyStringToClipboard(itemId);
				return;
			default:
				console.error("Unknown button group action", detail.id);
				return;
		}
	}

	return (
		<Table
			data-testid="readable-new-details-table"
			submitEdit={(e) => saveJobNameToDb(e)}
			columnDefinitions={[
				{
					id: "name",
					header: t("generic_name"),
					cell: (item) => formatJobNameId(item.name, item.id),
					isRowHeader: true,
					editConfig: {
						ariaLabel: "Name",
						editIconAriaLabel: "editable",
						errorIconAriaLabel: "Name Error",
						editingCell: (item, { currentValue, setValue }) => {
							return (
								<Input
									data-testid="readable-new-details-name-input"
									autoFocus={true}
									value={currentValue ?? item.name}
									onChange={(e) => updateJobName(e, setValue)}
									spellcheck
								/>
							);
						},
					},
				},
				{
					id: "createdAt",
					header: t("generic_created"),
					cell: (item) => formatTimestamp(item.createdAt),
				},
				{
					id: "updatedAt",
					header: t("generic_updated"),
					cell: (item) => formatTimestamp(item.updatedAt),
				},
			]}
			items={[props.metadataState]}
			loading={props.metadataState === undefined}
			loadingText={t("generic_loading")}
			header={
				// <Header>{t("generic_details")}</Header>
				<Header
					actions={
						<ButtonGroup
							onItemClick={({ detail }) =>
								handleButtonGroup(detail, textItem.itemId, index)
							}
							items={[
								{
									type: "menu-dropdown",
									id: "more-actions",
									text: t("generic_more_actions"),
									items: [
										{
											text: t("generic_other"),
											items: [
												{
													id: "copy-itemId",
													iconName: "script",
													text: t("generic_copy_id"),
												},
											],
										},
									],
								},
							]}
							variant="icon"
						/>
					}
				>
					{t("generic_details")}
				</Header>
			}
		/>
	);
}
