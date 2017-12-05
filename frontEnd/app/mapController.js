
// Deprecated
angular.module('nextGrid').controller('mapCtrl', function ($scope, $uibModal, DataModel, $cookies, $cookieStore, sharedService) {

	setupLeaflet($scope);
	initializeScope($scope);

	$scope.number = 45;

	$scope.logout = function () {
		sharedService.logout($scope, $cookies);
	};

	//on zoomend moved to the end of Draw Functions

	//moved to app/components/map/factories/managementArea.factory.js
	$scope.loadMetadata = function () {
		showWait('Initializing...', true);
		DataModel.getNav()
			.then(function (data) {
				$scope.metadata = data;
				_.forEach($scope.metadata, function (d) {
						if (d.type === 'sub') {
							try {
								$scope.subs.push({
									"sub": d._id,
									"box": [[d.feeders[0].tly, d.feeders[0].tlx], [d.feeders[0].bry, d.feeders[0].brx]],
									"ma": d.ma,
									"sc": d.sc,
									"feeders": d.feeders
								});
								for (var f = 0; f < d.feeders.length; f++) {
									$scope.feeders.push({
										"f": d.feeders[f].name,
										"ma": d.ma,
										"sc": d.sc,
										"substation": d._id,
										"bbox": [[d.feeders[f].tly, d.feeders[f].tlx], [d.feeders[f].bry, d.feeders[f].brx]],
									});
								}
							}
							catch (e) {
								alert("problem with substation " + d.sub);
							}
						}
						else if (d.type === "ma") {
							//$scope.maboxes.push({ "ma": d._id, "bbox": d.bbox });
							//$scope.mas.push(d._id);
							$scope.areas.push({
								"ma": d._id,
								"bbox": d.bbox,
								"svcs": [],
								"subs": []
							});
						}
						else if (d.type === "sc") {
							//$scope.scboxes.push({ "sc": d._id, "bbox": d.bbox });
							$scope.scs.push({ "name": d._id, "subs": [], "ma": null, "bbox": d.bbox });
						}
					}
				);
			}).then(function () {
			_.forEach($scope.subs, function (sub) {
				_.forEach($scope.areas, function (area) {
					if (sub.ma == area.ma) {
						area.subs.push(sub);
						if ($.inArray(sub.sc, area.svcs) == -1)
							area.svcs.push(sub.sc);

					}
				});
				_.forEach($scope.scs, function (sc) {
					if (sc.name == sub.sc) {
						sc.subs.push(sub._id);
						if (sc.ma == null)
							sc.ma = (sub.ma);

					}
				});
				//$.unblockUI();
			});
		})
			.then(function () {
				$.unblockUI();
			});
	};
	//end of move

	$scope.drawLightningDay = function () {
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'lightning';
		//$('#lightBtn').addClass('active');
		if (!$scope.oneDate)
			$scope.now = dateMinus(1);
		else
			$scope.now = $scope.oneDate;
		console.log($scope.now);
		DataModel.getLtgDay($scope.selectionType, $scope.selection, $scope.now)
			.then(function (data) {
					$scope.poles = data;
					drawLightningDaily($scope);
					$.unblockUI();
				}
			);
	};

	$scope.drawLightningYtd = function () {
		showWait();
		//console.log(DataModel);
		setBounds($scope, DataModel);
		$scope.activeLevel = 'lightning';
		$('#lightYBtn').addClass('active');
		if (!$scope.oneDate)
			$scope.now = dateMinus(1);
		else
			$scope.now = $scope.oneDate;

		DataModel.getLtgYTD($scope.selectionType, $scope.selection)
			.then(function (data) {
					$scope.ypoles = data;
					drawLightningYTD($scope);
					$.unblockUI();
				}
			);
		//console.log(DataModel);
	};

	//Known Momentaries and Outages
	$scope.drawEvents = function () {
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'events';
		$('#eventBtn').addClass('active');
		if (!$scope.oneDate)
			$scope.now = dateMinus(1);
		else
			$scope.now = $scope.oneDate;

		DataModel.getEvent($scope.selectionType, $scope.selection)
			.then(function (data) {
					$scope.events = data;
					drawEvents($scope);
					$.unblockUI();
				}
			);
	};

	//moved to controlPanel.directive.js
	$scope.drawEquipLog = function () {
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'equip';
		//$('#equipBtn').addClass('active');
		if (!$scope.oneDate)
			$scope.now = dateMinus(1);
		else
			$scope.now = new Date($scope.oneDate);

		DataModel.getEquip($scope.selectionType, $scope.selection).then(function (data) {
				$scope.equip = data;
				drawEquipmentLog($scope);
				$.unblockUI();
				if ($scope.equip.length < 1) {
					$('#equipMessage').removeClass("hide");
				} else {
					$('#equipMessage').addClass("hide");
				}
			}
		);

		$("#tab-wrapper").removeClass("tabHide hide");
		$("#tab-wrapper").addClass("tabShow");
		swapClass('#EquipLog,#elTabLink', '#chartTab, #faultsTab, #tktTab', 'active');
		$("#elTabLink").removeClass("hide");
		checkTab();
	};
	//end of move


	//moved to stem 
	$scope.drawCondAss = function () {
		var feederList;
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'cond';
		$('#condBtn').addClass('active');
		if (!$scope.oneDate)
			$scope.now = dateMinus(1);
		else
			$scope.now = $scope.oneDate;

		// Cond Assess does not know subs so give it a list of feeders
		if ($scope.selectionType === 'sub')
			feederList = $scope.feedersForSub;

		else
			feederList = $scope.selection;

		//console.log(feederList);
		DataModel.getCond($scope.selectionType, feederList).then(function (data) {
				$scope.cond = data;
				drawCond($scope);
				$.unblockUI();
			}
		);
	};
	//end of move

	//moved to controlPanel.directive.js
	$scope.drawTickets = function () {
		var feederList;
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'tickets';

		if (!$scope.oneDate)
			$scope.now = dateMinus(1);
		else
			$scope.now = $scope.oneDate;

		// TCMS does not know subs so give it a list of feeders
		if ($scope.selectionType === 'sub')
			feederList = $scope.feedersForSub;
		else
			feederList = $scope.selection;


		DataModel.getTicket($scope.selectionType, feederList)
			.then(function (data) {
				$scope.tickets = data;
				//console.log($scope.tickets);
				//drawTickets($scope);
				$.unblockUI();
			});

		$("#tab-wrapper").removeClass("tabHide hide").addClass("tabShow");
		swapClass('#tktTab, #tktTabLink', '#chartTab, #faultsTab,#EquipLog', 'active');
		$("#tktTabLink").removeClass("hide");
		checkTab();
	};
	//end of move

	$scope.drawPalms = function () {
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'palm';
		$('#palmBtn').addClass('active');
		DataModel.getPalm($scope.selectionType, $scope.selection)
			.then(function (data) {
					$scope.palms = data;
					drawPalms($scope);
					$.unblockUI();
				}
			);
	};

	$scope.clearFaultEvents = function () {
		clearFaults($scope);
	};

	$scope.showOneFault = function (id) {
		drawFault($scope, id);
	};

	//moved to map.controller.js
	$scope.loadFaults = function () {
		if (!$scope.oneDate) {
			$.growlUI('Please pick a fault date.');
			$scope.boxes.faultsChecked = false;
			return;
		}
		else if (typeof ($scope.oneDate) === "string") {
			$scope.oneDate = new Date($scope.oneDate);
		}
		showWait('Loading Faults...', true);
		setBounds($scope, DataModel);
		$scope.activeLevel = 'faults';
		$scope.faults = [];

		//moved to faults.factory
		DataModel.getFault($scope.selectionType, $scope.selection, $scope.oneDate, moment($scope.oneDate).add(1, 'day').toDate())
			.then(function (data) {
				if (data && data.length) {
					$scope.faults = data;
					//console.log($scope.faults);
					//setTimeout(function () {
					//    $("#tab-wrapper").removeClass("tabHide hide").addClass("tabShow");
					//    swapClass('#faultsTab, #faultTablink', '#chartTab, #EquipLog, #tktTab', 'active');
					//    $("#faultTablink").removeClass("hide");
					//}, 150);
				}
				else if (data.error) {
					$.growlUI(data.error);
				}
				//$.unblockUI();
			})
			.then(function () {
				setTimeout(function () {
					$("#tab-wrapper").removeClass("tabHide hide").addClass("tabShow");
					swapClass('#faultsTab, #faultTablink', '#chartTab, #EquipLog, #tktTab', 'active');
					$("#faultTablink").removeClass("hide");
					checkTab();
					$.unblockUI();
				}, 1000);

			});
		//	end of move


	};
	//end of move

	$scope.filterFaults = function () {
	};

	$scope.drawVines = function () {
		showWait();
		setBounds($scope, DataModel);
		$scope.activeLevel = 'vines';
		$('#vinesBtn').addClass('active');
		$scope.then = dateMinus($scope.daysBackVines.value);
		DataModel.getVine($scope.selectionType, $scope.selection, $scope.then, $scope.now)
			.then(function (data) {
				$scope.vines = data;
				drawVines($scope);
				drawVinesDashboard();
				$.unblockUI();
				setTimeout(function () {
					$("#tab-wrapper").removeClass("tabHide hide").addClass("tabShow");
					swapClass('#chartTab, #vineTablink', '#faultsTab, #EquipLog, #tktTab', 'active');
					$("#vineTabLink, #vineBars").removeClass("hide");
					checkTab();

				}, 500);
			});
	};

	//AJH to hook up to Checkboxes!
	$('input:checkbox').change(function () {
		var cbID = event.target.id;
		var checkbox = event.target;
		//console.log(cbID + ' box changed\n'+ checkbox);
		if (checkbox.checked) {
			//elseIf for which checkbox
			if (cbID === 'cbVines') {
				$scope.drawVines();
			}
			else if (cbID === 'cbGrid') {
				drawGrid($scope, DataModel);
			}
			else if (cbID === 'cbLit') {
				$scope.drawLightningDay();
			}
			else if (cbID === 'cbLitHeat') {
				$scope.drawLightningYtd();
			}
			else if (cbID === 'cbFaults') {
				$scope.loadFaults();
			}
			else if (cbID === 'cbPalms') {
				$scope.drawPalms();
			}
			else if (cbID === 'cbEL') {
				$scope.drawEquipLog();
			}
			else if (cbID === 'cbCA') {
				$scope.drawCondAss();
			}

			else if (cbID === 'cbTT') {
				$scope.drawTickets();
			}
			//	known momentaries & Feeder outages
			else if (cbID === 'cbMomOut') {
				$scope.drawEvents();
			}
			//else if (cbID === 'cbAFS') {
			//                 //$scope.drawXXXX();
			//}
			//else if (cbID === 'cbFCI') {
			//                 //$scope.drawXXXX();
			//}
			//else if (cbID === 'cbBreakerOps') {
			//                 //$scope.drawXXXX();
			//}
			//else if (cbID === 'cbEcalls') {
			//                 //$scope.drawXXXX();
			//}
			//else if (cbID === 'cbLiveSw') {
			//                 //$scope.drawXXXX();
			//}
		}
		else {
			//console.log('UN-CHECKED')
			if (cbID === 'cbVines') {
				clearVines($scope);
				$("#tab-wrapper").removeClass("tabShow");
				$("#tab-wrapper").addClass("tabHide");
			}
			else if (cbID === 'cbLit') {
				clearLightningDaily($scope);
			}
			else if (cbID === 'cbLitHeat') {
				clearLightningYTD($scope);
			}
			else if (cbID === 'cbFaults') {
				clearFaults($scope);
			}
			else if (cbID === 'cbPalms') {
				clearPalms($scope);
			}
			else if (cbID === 'cbEL') {
				clearEquip($scope);
			}
			else if (cbID === 'cbCA') {
				clearCond($scope);
			}

			else if (cbID === 'cbTT') {
				clearTickets($scope);
			}
			else if (cbID === 'cbMomOut') {
				clearEvents($scope);
			}
			//else if (cbID === 'cbGrid') {
			//	clearGrid($scope);
			//}
			//else if (cbID === 'cbAFS') {
			//                 //clearXXXX($scope);
			//}
			//else if (cbID === 'cbFCI') {
			//                 //clearXXXX($scope);
			//}
			//else if (cbID === 'cbBreakerOps') {
			//                 //clearXXXX($scope);
			//}
			//else if (cbID === 'cbEcalls') {
			//                 //clearXXXX($scope);
			//}
			//else if (cbID === 'cbLiveSw') {
			//                 //clearXXXX($scope);
			//}
		}
	});

	$scope.clearMIT = function () {
		$scope.clearMA();
		//$scope.mitmatrix = [];
		$scope.momsIR = [];
		$scope.mitsub = '';
		$scope.feeder = '';
		$scope.changeMIT('matrix');
		console.log("ma " + $scope.ma);
		console.log("mit Sub " + $scope.mitSub);
		console.log("sub " + $scope.sub);
		console.log("feeder " + $scope.feeder);

		$scope.ma = '';
		$scope.sc = '';
		$scope.sub = '';
		$scope.mitSub = '';
		$scope.feeder = '';
		setTimeout(function () {
			$('#MITmalist').val('');
			$('#MITsublist').val('');
			$('#MITfeederlist').val('');
		}, 50);
		console.log("AFTER");
		console.log("ma " + $scope.ma);
		console.log("mit Sub " + $scope.mitSub);
		console.log("sub " + $scope.sub);
		console.log("feeder " + $scope.feeder);
	};

	//resets everything to on load values
	$scope.clearUI = function () {
		showWait('Cleaning up...', true);
		$scope.activeLevel = '';
		//$scope.selectionType = '';
		$scope.clearMA();
		$scope.now = new Date();
		$scope.resetMap(true);
		$scope.mitSort = { sortMit: '', sortIR: 'date', reverse: false };
	};

	//clears the map
	$scope.resetMap = function (unblock) {
		try {
			clearVines($scope);
			clearLightningDaily($scope);
			clearLightningYTD($scope);
			clearEvents($scope);
			clearEquip($scope);
			clearFaults($scope);
			clearCond($scope);
			clearPath($scope);
			clearPalms($scope);
			clearTickets($scope);

			clearGrid($scope);
			$('input:checkbox').removeAttr('checked');
			$('#tab-wrapper').removeClass('tabShow');
			$('#tab-wrapper').addClass('tabHide hide');
			checkTab();
			$("#faultTablink, #elTabLink, #vineTabLink, #tktTabLink").addClass("hide");
			if (unblock)
				setTimeout(function () {
					$.unblockUI();
				}, 150);
		}
		catch (e) {
			console.log(e);
		}
		finally {
		}
	};

	$scope.showLogin = function () {
		$uibModal.open({
			animation: $scope.animationsEnabled,
			//draggable: true,
			templateUrl: '/modals/login.html',
			controller: 'loginCtrl',
			scope: $scope,
			size: 'me'

		});
	};

	//moved to map.controller.js
	$scope.openMatrixModal = function (e) {
		showWait();
		var dt = new Date();
		dt.setDate(dt.getDate() - 365);
		var mit = {
			dtbegin: dt.toISOString().split('T')[0], // '2016-01-05',
			dtend: $scope.then.toISOString().split('T')[0], //'2016-01-05',
			feeder_num: ''
		};

		DataModel.getMatrix(mit)
			.then(function (data) {
				$scope.mitmatrix = [];
				$scope.mitmatrix = data;

				$uibModal.open({
					animation: $scope.animationsEnabled,
					draggable: true,
					templateUrl: '/modals/mit-matrix.html',
					controller: 'showMatrixCtrl',
					scope: $scope,
					size: 'lg',

				});
				$.unblockUI();
				window.setTimeout(function () {
					if ($scope.ma) {
						document.getElementById("MITmalist").value = $scope.ma;
						if ($scope.sub) {
							document.getElementById("MITsublist").value = $scope.sub;
							if ($scope.feeder) {
								document.getElementById("MITfeederlist").value = $scope.feeder;
							}
						}
					}
				}, 150);
			});
	};

	//moved to directive
	$scope.doClick = function (e) {
		getCursorPos($scope, e);
		if ($scope.activeLevel === 'vines') {
			$scope.vine = findVine($scope);
			if ($scope.vine !== null)
				$uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/modals/editVines.html?bust=' + Math.random().toString(36).slice(2),
					controller: 'editVineCtrl',
					scope: $scope,
					size: 'me'
				});
		}
		else { //default to grid
			$scope.rcRow = findIcon($scope);
			if ($scope.rcRow !== null)
				$uibModal.open({
					animation: $scope.animationsEnabled,
					templateUrl: '/modals/showAsset.html?bust=' + Math.random().toString(36).slice(2),
					controller: 'assetCtrl',
					scope: $scope,
					size: 'sm'
				});
		}
	};
	//end of move to directive

	$scope.showVinesList = function () {
		$uibModal.open({
			animation: $scope.animationsEnabled,
			templateUrl: '/modals/showVines.html?bust=' + Math.random().toString(36).slice(2),
			controller: 'showVineCtrl',
			scope: $scope,
			size: 'lg'
		});
	};


	// moved to leaflet.directive.js
	$scope.doRightClick = function (e) {
		getCursorPos($scope, e);
		//if ($scope.activeLevel === 'vines') {
		//	$uibModal.open({
		//		animation: $scope.animationsEnabled,
		//		templateUrl: '/modals/showVines.html?bust=' + Math.random().toString(36).slice(2),
		//		controller: 'showVineCtrl',
		//		scope: $scope,
		//		size: 'lg'
		//	});
		//}
		//else
		if ($scope.activeLevel === 'cond') {
			$scope.rcRow = findIcon($scope);
			$uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: '/modals/condAss.html?bust=' + Math.random().toString(36).slice(2),
				controller: 'condCtrl',
				scope: $scope,
				size: 'me'
			});
		}
	};
	//end of move 

	// for dropdown selections of Management Areas (ma) / Service Center (sc, svc) / Substations (sub, subs)/ Feeders
	$scope.maSelect = function () {
		var mySelect = event.target;
		$scope.ma = mySelect.options[mySelect.selectedIndex].text;
		$scope.selection = $scope.ma;
		$scope.selectionType = "ma";
		$scope.substationMA = [];
		$scope.clearSvcCenter();
		$scope.resetMap(true);
		document.getElementById("malist").value = mySelect.options[mySelect.selectedIndex].text;
		if ($("#MITmalist").length) {
			document.getElementById("MITmalist").value = mySelect.options[mySelect.selectedIndex].text;

		}
		$scope.currentPage = 1;
		$scope.subFilter();
	};

	$scope.scSelect = function () {
		var mySelect = document.getElementById("sclist");
		$scope.sc = mySelect.options[mySelect.selectedIndex].text;
		$scope.selection = $scope.sc;
		$scope.selectionType = "sc";
		$scope.clearSubstation();
		$scope.resetMap(true);
		var subsarr = $scope.subs;
		if ($scope.sc !== "") {
			$scope.ma = $scope.subs[findWithAttr(subsarr, 'sc', $scope.sc)].ma;
			$('#malist').val($scope.ma);
			$scope.sFilter = $scope.sc;
		} else {
			$scope.clearSvcCenter();
		}
		$scope.subFilter();

	};

	$scope.subSelect = function () {
		var mySelect = event.target;
		$scope.sub = mySelect.options[mySelect.selectedIndex].text;
		$scope.selection = $scope.sub;
		$scope.selectionType = "sub";
		$scope.chosenFeeders = [];
		_.forEach($scope.feeders, function (feeder) {
			if (feeder.substation === $scope.sub) {
				$scope.chosenFeeders.push(feeder);
				//console.log(feeder);
			}
		});
		//console.log($scope.chosenFeeders);
		//
		$scope.resetMap(true);
		var subsarr = $scope.subs;
		var subIndex = findWithAttr(subsarr, 'sub', $scope.sub);
		if ($scope.sub !== "") {
			$scope.sc = $scope.subs[subIndex].sc;
			$scope.ma = $scope.subs[subIndex].ma;
			setTimeout(function () {
				$('#sclist').val($scope.sc);
			}, 25);
			$('#malist').val($scope.ma);
			$scope.subFilter();
		} else {
			$scope.clearSubstation();
		}

		document.getElementById("sublist").value = mySelect.options[mySelect.selectedIndex].text;
		if ($("#MITsublist").length) {
			document.getElementById("MITsublist").value = mySelect.options[mySelect.selectedIndex].text;
			setTimeout(function () {
				document.getElementById("sublist").value = mySelect.options[mySelect.selectedIndex].text;
			}, 25);
		}
		if ($("#MITmalist").length) {
			document.getElementById("MITmalist").value = $scope.ma;
		}
		$('#search').val('');
		$scope.currentPage = 1;
		$scope.mitSub = $scope.sub.replace(/_/g, " ");
		$scope.clearFeeder();
	};

	//for Substation search input
	$scope.onSelect = function ($item, $model, $label) {
		//console.log($item);
		$scope.sub = $item.sub;
		$scope.selection = $scope.sub;
		$scope.selectionType = "sub";
		$scope.feeder = "";
		$scope.chosenFeeders = [];
		_.forEach($scope.metadata, function (metadata) {
			if (metadata.type === 'sub' && metadata.sub === $scope.sub) {
				_.forEach(metadata.feeders, function (feeder) {
					$scope.chosenFeeders.push(feeder);
				});
			}
		});
		$scope.resetMap(true);

		var subsarr = $scope.subs;
		$scope.ma = $scope.subs[findWithAttr(subsarr, 'sub', $scope.sub)].ma;
		$('#malist').val($scope.ma);
		$scope.sc = $scope.subs[findWithAttr(subsarr, 'sub', $scope.sub)].sc;
		window.setTimeout(function () {
			$scope.MA = $scope.ma;
			//$scope.sFilter = $scope.sc;
			$('#sublist').val($scope.sub);
			$('#sclist').val($scope.sc);
		}, 50);
		$scope.subFilter();
		$('#sclist').val($scope.sc);
	};

	$scope.subFilter = function () {
		if ($scope.sc !== "") {
			$scope.sFilter = $scope.sc;
		} else if ($scope.sc === "" && $scope.ma !== "") {
			$scope.sFilter = $scope.ma;
		} else {
			$scope.sFilter = '';
		}
	};

	$scope.feederSelect = function () {
		//var mySelect = document.getElementById("feederlist");
		var mySelect = event.target;
		$scope.feeder = mySelect.options[mySelect.selectedIndex].text;
		$scope.selection = $scope.feeder;
		$scope.selectionType = "feeder";
		$scope.resetMap(true);

		$scope.currentPage = 1;
		if ($scope.feeder === '')
			return;
		//setBounds($scope, DataModel); ////////////////////////
		DataModel.getCEMI($scope.feeder).then(function (data) {
			if (data.length) {
				$scope.cemi.ytd = data[0].CEMIYTD;
				$scope.cemi.twmoe = data[0].CEMI12MOE;
			}
			else
				$scope.cemi = { ytd : 0, twmoe: 0 };

		});
		if ($scope.momsIR)
			$scope.matchTickets();
	};

	$scope.getWeather = function (cat, str) {
		if (!str || str === 'NULL' || str === 'Clr')
			return 'N';
		return (str.indexOf(cat) !== -1 ? 'Y' : 'N');
	};

	$scope.changeMIT = function (btn) {
		$scope.showMitBtns = btn;

		if ($scope.showMitBtns == 'matrix') {
			$('#mitTable').addClass('active in');
			$('#mitInvReport').removeClass('active in');
			$('#mitTabLink').addClass('active');
			$('#mitIRLink').removeClass('active');
			$scope.momsIR = [];
			swapClass('#mitTable', '#mitInvReport', 'active in');
			swapClass('#mitTabLink', '#mitIRLink', 'active');

			if ($scope.mitmatrix.length == 0)
				openMatrixModal();
		}
		else if ($scope.showMitBtns == 'investigation') {
			if ($scope.feeder === '') {
				$.growlUI('Please pick a Feeder.');
				return;
			}

			showWait();
			var dt = new Date();
			dt.setDate(dt.getDate() + 1);
			var mit = {
				dtbegin: new Date().getFullYear() + '-01-01',    // '2016-01-01',
				dtend: dt.toISOString().split('T')[0], //'2016-01-05',
				feeder_num: $scope.feeder
			};

			DataModel.getInvReport(mit).then(function (data) {
				$scope.momsIR = [];
				$scope.momsIR = data;
				$.unblockUI();
			})
				.then(function (data) {
					$scope.matchTickets();
				});

			swapClass('#mitInvReport', '#mitTable', 'active in');
			swapClass('#mitIRLink', '#mitTabLink', 'active');
		}

		$('#mitTxtFilter').val("");
		$scope.mitSort = { sortMit: '', sortIR: 'date_time', reverse: false };
	};
	$scope.matchTickets = function () {
		var fdr = $scope.feeder;
		var r = $scope.momsIR;

		var cnt = _.countBy(r, function (item) {
			return item.fdr_num == fdr;
		});

		if (!cnt.true >= 1)
			return;

		showGridNotification();
		DataModel.getFeederTickets(fdr).then(function (tickets) {
			for (var i = 0, len = r.length; i < len; i++) {

				for (var t in tickets) {
					var mom = moment(r[i].event_dttm);
					if (Math.abs(mom.diff(tickets[t].DT, 'minutes')) <= 30) {
						r[i].trbl_tckt_num = tickets[t].TRBL_TCKT_NUM;
						r[i].irpt_caus_code = tickets[t].IRPT_CAUS_CODE;
						r[i].tckt_type_code = tickets[t].TCKT_TYPE_CODE;
						//console.log(r[i].fdr_num + ' matched');
						break;
					}

				}
				if (r[i].trbl_tckt_num !== '' | r[i].weather !== null && r[i].weather !== 'Clr') {
					r[i].status_code = 'Explained';
				}
				else
					r[i].status_code = 'Unexplained';

			}
			$('.notifyjs-wrapper').trigger('notify-hide');

		});
	};
	//For editing the MIT Investigation Report Table
	$scope.saveMom = function (rid, comments, tln, cause_code) {
		var payload = {
			rid: rid,
			comments: comments,
			tln: tln,
			cause_code: cause_code
		};
		DataModel.setInvReport(payload).then(function (data) {
			$.growlUI(data.message);

		});
		//console.log("Donna Noble has left the library. Donna Noble has been saved.");
		//console.log(data);
		////example from js fiddle: http://jsfiddle.net/NfPcH/93/
		//$scope.saveUser = function (data, id) {
		//	//$scope.user not updated yet
		//	angular.extend(data, { id: id });
		//	return $http.post('/saveUser', data);
		//};
	};

	//sort functions for MIT tables
	$scope.mitKey = function (key) {
		$scope.mitSort.sortMit = key;   //set the sortKey to the param passed
		$scope.mitSort.reverse = !$scope.mitSort.reverse; //if true make it false and vice versa
	};
	$scope.mitIrKey = function (key) {
		$scope.mitSort.sortIR = key;   //set the sortKey to the param passed
		$scope.mitSort.reverse = !$scope.mitSort.reverse; //if true make it false and vice versa
	};
	$scope.vinesKey = function (key) {
		$scope.vinesSort.key = key;   //set the sortKey to the param passed
		$scope.vinesSort.reverse = !$scope.vinesSort.reverse; //if true make it false and vice versa
	};

	//AJH 03/30 currently just alerts
	$scope.createTT = function () {
		if (confirm('THIS FEATURE IS CURRENTLY NON-FUNCTIONAL\n Are you sure you want to create a Trouble Ticket?')) {
			// create Trouble Ticket code goes here. 

			//if success
			alert('THIS FEATURE IS CURRENTLY NON-FUNCTIONAL\n Your Trouble Ticket has NOT been created');

			//if failed
			//alert('An error has occurred, your Ticket was not created.');
		} else {
			// Do nothing
		}
	};

	//Reuseable Dropdown list clear functions
	$scope.clearFeeder = function(){
		$scope.feeder = '';
		setTimeout(function () {
			$('#feederlist').val('');
			if ($("#MITfeederlist").length) {
				$("#MITfeederlist").val('');
			}
		}, 100);
		if ($scope.sub !== '') {
			$scope.selectionType = "sub";
			$scope.selection = $scope.sub;
		}
		clearGrid($scope);
	};

	$scope.clearSubstation = function () {
		$scope.sub = '';
		$scope.SUB = '';
		$scope.mitSub = '';
		setTimeout(function () {
			$('#sublist').val('');
			if ($("#MITsublist").length) {
				$("#MITsublist").val('');
			}
		}, 100);
		if ($scope.sc !== '') {
			$scope.selectionType = "sc";
			$scope.selection= $scope.sc;
		}
		//else if ($scope.ma !== '') {
		//	$scope.selectionType = "ma";
		//	$scope.selection= $scope.ma;
		//} else {
		//	$scope.selectionType = '';
		//};
		$scope.clearFeeder();
	};
	$scope.clearSvcCenter = function () {
		$scope.sc = '';
		$('#sclist').val('');
		$scope.clearSubstation();
		if ($scope.ma !== '') {
			$scope.selectionType = "ma";
			$scope.selection = $scope.ma;
		} else {
			$scope.selectionType = '';
		}
		$scope.subFilter();
	};
	$scope.clearMA = function () {
		$scope.ma = '';
		$scope.selectionType = '';
		setTimeout(function () {
			$('#malist').val('');
			if ($("#MITmalist").length) {
				$('#MITmalist').val('');
			}
		}, 0);
		$scope.clearSvcCenter();
		$scope.subFilter();
	};

	var init = function () {
		if ($cookies.get('nextGrid_slid')) {
			$scope.usr.slid = $cookies.get('nextGrid_slid');
			$scope.loadMetadata();
		}
		else
			$scope.showLogin();
	}();



});     // end of mapCtrl





