export const lang = {
  collector: {
    userName: 'User name',
    password: 'Password',
    serverName: 'Server name',
    ezSocketOpenDeviceType: 'EZSocket Open Device Type',
    protocol: 'Protocol type',
    preprocessConfig: 'Preprocessing config',
    addCollector: 'Add new collector',
    addMachineTips: 'Please add the machine first, and then add the collector for the machine!',
    noAdapter: 'No collector',
    goAdd: 'Go add',
    noData: 'No data',
    adapterName: 'Collector name',
    adapterType: 'Collector type',
    connectStatus: 'Connect state',
    status: 'State',
    connectWay: 'Connect way',
    operater: 'OP',
    confirmDelete: ({ named }) => `Confirm deleting${named('val')}？`,
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    tips: 'Tips',
    pmcControlType: 'PMC contorl type',
    deviceManufacturer: 'Device manufacturer',
    model: 'Model number',
    ipAdress: 'IP address',
    port: 'Port number',
    channelNum: 'Channel number',
    sampleFrequency: 'Sample frequency',
    connectionMethod: 'Connection Method',
    serialConnection: 'Serial Connection',
    networkPortConnection: 'Network Connection',
    dataResource: 'Data Resource',
    controlAddress: 'Control Address',
    onOffAddress: 'On Off Address',
    bindChannel: 'Bind Channel',
    onOffDataResource: 'On Off Data Resource',
    gatherType: 'Collect type',
    speedRate: 'Speed knob override',
    FeedRate: 'Feed knob override',
    collectionFrequency: 'Collect frequency',
    acquisitionRange: 'Collect range',
    selectAdapterName: 'Please select collector name',
    inputAdapterName: 'Please enter collector name',
    adapterNameLimit20: 'The collector name only supports 20 characters!',
    selectDeviceManufacturer: 'Please select device manufacturer',
    selectModel: 'Please select model name',
    inputPort: 'Please enter port number',
    portLimit: 'Port numbers range from 1 to 65535!',
    inputIPAdress: 'Please enter IP adress',
    inputIPAdressLimit: 'The IP address is invalid',
    inputChannel: 'Please enter channel number',
    inputPositiveInt: 'Please enter a positive integer',
    inputSampleFrequency: 'Please enter sample frequency',
    inputInt: 'Please enter a positive number',
    inputGatherType: 'Please select collect type',
    inputControlType: 'Please select control type',
    inputCollectionFrequency: 'Please enter collect frequency',
    collectionFrequencyLimt: 'The collect frequency is within 100000!',
    selectAcquisitionRange: 'Please select collect range',
    inputMachineId: 'Please enter machine_id',
    inputMachinePort: 'Please enter machine_port',
    inputHostId: 'Please enter host_id',
    inputHostPort: 'Please enter host_port',
    inputAccount: 'Please enter user name',
    inputPassword: 'Please enter password',
    inputPeriod: 'Please enter server name',
    inputProtocolType: 'Please enter protocol type',
    inputEzSocketOpenDeviceType: 'Please enter EZSocket open device type',
    NameLimit: 'The name already exists, please set a new name!',
    NCAddTips: 'The NC collector cannot be added again!',
    connectStatusList: 'Connecting, please wait...',
    operateSuccess: 'Operate Success',
    detail: 'Detail',
    hardwareInfo: 'Hardware information',
    numericalControl: 'Numerical control manufacturer',
    adapterNameLimit10: 'The collector name only supports 10 characters!',
    connectSuccess: 'Connect Success',
    connectFail: 'Connect Failure',
    editSuccess: 'Edit Success',
    NCTimeInfo: 'NC real-time information',
    addCustomField: 'Add new ustom collection field',
    name: 'Name',
    collectWay: 'Collect way',
    macroVariable: 'Macrovariable',
    fixedValue: 'Fixed value',
    value: 'Value',
    targetAddress: 'Target address',
    type: 'Type',
    customField: 'Custom collection field',
    inputName: 'Please enter name',
    inputCollectWay: 'Please select collect way',
    inputTargetAddress: 'Please enter target address',
    selectType: 'Please select type',
    realTimeValue: 'Real-time value',
    operate: 'OP',
    inputAllInfo: 'Please fill in the complete information!',
    updateSuccess: 'Update Sucess',
    deleteSuccess: 'Delete Success',
    editFieldAdress: 'Edit the field collection address',
    selectChannel: 'Select channel',
    adress: 'Adress',
    realTimeData: 'Real-time information',
    DOOutput: 'DO output',
    saveStatus: 'Saving, please wait...',
    HXPower: 'Combined power',
    BXElectricity: 'B-phase current',
    CXVoltage: 'C-phase voltage',
    ADVoltage: 'AD analog voltage',
    sendPulse: 'Send pulse',
    selectDO: 'Select DO',
    pulseStatus: 'Initial pulse state',
    pulseTime: 'Pulse time(ms)：',
    set0: 'Set 0 to no bit',
    pulseTimeLimit:
      'The pulse time is incorrect. The minimum support is 0s, and the maximum support is 60s',
    hardwareSet: 'Hardware configuration',
    thresholdSet: 'Threshold setting',
    ADVoltageThreshold: 'AD analog voltage threshold',
    tcMachineId: 'Machine ID',
    inputTcMachineId: 'Please enter machine ID',
    collectMode: 'Please select collect mode',
    collectFreq: 'Please select collect frequency',
    inputControlAddress: 'Please select control address',
    inputOnOffAddress: 'Please select on-off address',
    addMachineFail: 'DC Server is not connected, please check the connection status!',
    lookToolLife: 'View tool life'
  },
  latheContent: {
    delete: 'Delete',
    addMachineTool: 'Add new machine tool',
    cancel: 'Cancel',
    prompt: 'Prompt',
    confirm: 'Confirm',
    add: 'Go add',
    notYetTitle: 'No machine tool information yet',
    sureDelete: ({ named }) => `Confirm deleting${named('val')}？`,
    deviceId: 'device_ID',
    machineToolKinds: 'Machine tool type',
    sensingDevices: 'Sensing devices',
    notYetSensingDevices: 'No sensing device',
    machiningEvents: 'Processing event',
    notYetMachiningEvents: 'No processing event',
    findOutMore: 'View details',
    machineToolName: 'Machine tool name',
    machineToolType: 'Machine tool Type',
    machineToolBrand: 'Machine tool brand',
    machineToolCompose: 'Machine tool composition',
    addNew: 'Add new',
    machiningCenters: 'Machining Center',
    lathe: 'Lathe',
    turnMillCompound: 'Turn-milling combination',
    scheming: 'Swiss type lathes',
    customize: 'user-defined',
    numberchannels: 'channel number',
    numberSpindles: ' spindle number',
    numberPowerHeads: 'Number of Power heads',
    singleSpindleMachiningCenters: 'single-spindle machining center',
    doubleSpindleMachiningCenters: ' twin-spindle machining center',
    singleSpindleLathe: 'single-spindle lathe',
    singleSpindleDotaLathe: 'single-spindle lathe with turret',
    doubleSpindleDotaLathe: 'dual-spindle lathe with mill-turn turret',
    doubleSpindleDoubleDotaLathe: 'dual-spindle lathe with dual mill-turn turrets',
    doubleSpindleThreeDotaLathe: 'dual-spindle lathe with tripling mill-turn turrets',
    singleChannelTurnMillCompound: 'Single-channel turn-mill combination',
    singleDotaTurnMillCompound: 'Single Turret Turn-Mill Combination',
    mainTwoSecondaryTwo: 'dual-spindle with an indexing turret tooling',
    mainTwoSecondaryOne: 'Dual Spindle Single Sub-spindle',
    mainThreeSecondaryTwo: 'Three main spindles and two sub-spindles',
    confirmDeletion: 'Confirm deletion',
    machineToolKindsSelect: 'Selecting the Type of Machine Tool',
    spindles: 'spindle',
    powerHeads: 'Power Heads',
    channels: 'Channels',
    pleaseSelect: 'Please select',
    pleaseEnter: 'Please enter',
    deleteTheMachineTool: 'Please select the machine tool to delete first!',
    operateSucceed: 'Operation successful!',
    machineToolNameonRepeat: 'Please enter the name of the machine tool, no duplicates!',
    machineIdonRepeat: 'Please enter the machine ID, no duplicates!',
    inputLenght: 'Input length must not exceed ten characters!',
    selectMachineToolCompose: 'Please select the components of the machine tool!',
    selectnumberchannels: 'Please select the number of channels!',
    selectnumberSpindles: 'Please select the number of spindles!',
    selectnumberPowerHeads: 'Please select the number of power heads!',
    machineToolNameoOccupation: 'The machine tool name has been occupied',
    addNewSccess: 'Added successfully!',
    reviseSccess: 'Modified successfully!',
    MachineToolinputLenght: 'The length of the machine name cannot exceed ten characters!',
    axislNameonRepeat: 'Please enter the name of the axis, it cannot be repeated!',
    axislinputLenght: 'The axis name cannot exceed ten characters!',
    axisNameRepeat: 'Axis name is duplicated!',
    axisNameReviseSccess: 'Axis name modified successfully!',
    variation: 'Variation',
    spindlesOne: 'Spindles 1',
    spindlesTwo: 'Spindles 2',
    layshaft: 'Sub-spindle',
    spindlePowerHeads: 'Spindle Power Head',
    layshaftPowerHeads: 'Sub-spindle Power Head',
    spindlesFrontPowerHeads: 'Front Spindle Power Head',
    spindlesBackPowerHeads: 'Rear Spindle Power Head',
    toolpindle: 'Tool Spindle',
    dotaPowerHeads: 'Turret Power Head',
    ncsystem: 'cnc',
    ncInformation: 'NC Information',
    monitorAxisInformation: 'Monitor Axis Information',
    imgFailedToLoad: 'Image failed to load',
    location: 'Location：',
    relevancySensor: 'Related Sensor：',
    selectAll: 'Select All',
    preserve: 'Preserve',
    more: 'More',
    namedRules: 'Named Rules',
    judgmentCondition: 'Judgment Condition',
    deleteTitleContent:
      'Are you sure you want to proceed with the deletion of the event configuration?',
    relevancySccuss: 'Relevancy Successful!',
    deleteSccuss: 'Delete Successful!',
    reviseSccuss: 'Edit Successful!',
    edit: 'edit',
    eventConditionOpen: 'Event Condition Activation On',
    eventConditionOpenClose: 'Event Condition Activation Off',
    inputMonitorChannelName: 'Please enter the monitor channel name',
    MonitorChannelName: 'Monitor Channel Name',
    processingRunEffect: 'Effective during Processing Operation',
    eventConditionEnable: 'Effective when the Event Condition Occurs',
    eventChannelsSttribute: 'Event Channel Attributes.',
    dataSynchronizationSource: 'Data Synchronization Source',
    ChannelsRunCondition: 'Channels Run Condition',
    eventCondition: 'Event Condition',
    addCondition: 'Add Condition',
    conditionOne: 'Condition1:',
    save: 'Save',
    condition: 'Condition',
    channelsSttribute: 'Channel Attributes',
    inputNumber: 'Please Enter a number',
    minPickOneNamedRules: 'Select at Least One Named Rule',
    differentProcessingEventNameNoRepeat:
      'The names between different processing event cards cannot be repeated',
    monitorChannesNameNoEmpty: 'The monitor channel name cannot be empty',
    monitorChannesNameLength: 'The monitor channel name cannot exceed 10 characters',
    pleaseFillOut: 'Please fill out',
    content: 'Content',
    machineHandoff: 'Machine Handoff',
    backOverview: 'Back to Overview',
    noMachineModelImg: 'No Machine Model Image Available',
    online: 'Online',
    offline: 'Offline',
    alarm: 'Alarm',
    run: 'Run',
    undefined: 'Undefined',
    connectError: 'Connection Error',
    autoRunOpen: 'Auto-Run Started',
    autoRunClose: 'Auto-Run Stopped',
    autoRunStandby: 'Auto-Run Standby',
    autoRunKeep: 'Auto-Run Keep',
    axisAttribute: 'Axis Attribute',
    defaultMonitorSignal: 'Default Monitoring Signal',
    countCutterNum: 'Corresponding Tool Number',
    goadd: 'Add',
    sttributeSet: 'Attribute Setting',
    channeRunEffect: 'Channel Run Condition Effectiveness',
    monitoringMianAxis: 'Monitoring Main Axis',
    monitoringChanneType: 'Monitoring Channel Type',
    axisSet: 'Axis Setting',
    axisAttributeSet: 'Axis Attribute Setting: ',
    releSenDevice: 'Associated Sensor Device:',
    toolnumRele: 'Tool Number Association',
    followWay: 'Follow Mode: ',
    confirmDelete1:
      '({ named}) => `Are you sure you want to delete channel ${named(val)} ${named(tool)}?`',
    pleaseSelectASxisAttributeSet: 'Please select axis attribute setting',
    pleaseSelectReleSenDevice: 'Please select associated sensor device',
    pleaseSelectDefaultMonitorSignal: 'Please select default monitoring signal',
    pleaseSelectFollowWay: 'Please select follow mode',
    toolNumVoid: 'Tool number already exists',
    customAdd: 'Custom Add',
    channelNum: 'Channel Number: ',
    toolnumOneTwo: 'Tool Number (Choose One):',
    toolInterOneTwo: 'Or Tool Number Range (Choose One)',
    pleaseEnterToolnum: 'Please enter tool number',
    ruleTooNum: 'End tool number cannot be less than start tool number',
    pleaseSelectchannelNum: 'Please select channel number',
    belongsChannel: 'Belongs to Channel: ',
    pleaseSelectMonitorChannelType: 'Please select monitoring channel type',
    pleaseSelectMonitoringMianAxis: 'Please select monitoring main axis',
    pleaseSelectdataSynchronizationSource: 'Please select data synchronization source',
    procCondintoEffect: 'Channel Condition Effectiveness',
    bigBatch: 'Large Batch',
    smallBatch: 'Small Batch',
    saveSuccess: 'Save Successful',
    noDisposition: 'Not Configured',
    defaultFollow: 'Default Follow',
    jumpDisposition: 'Jump Configuration',
    axisLapseWords: ({ named }) =>
      `Channel ${named('channel_num')} Tool Number ${named('toolnum')} Associated with Axis ${named(
        'axis'
      )} is Invalid`,
    machineId: 'Machine ID',
    importLoading: 'Import Loading...',
    importSuccess: 'Import Successful, please check!',
    importFailed: 'Import Failed, please try again or do the manual configuration!',
    importPreventSuccess: 'Stop Importing Successful!',
    importPreventFailed: 'Stop Importing Failed!',
    exportLoading: 'Export Loading...',
    exportSuccess: 'Export Successful!',
    exportFailed: 'Export Failed!'
  },
  dictionaryCont: {
    addCutterType: 'Add Cutter Type',
    addCutter: 'Add Cutter',
    sureDeleteCutterType: 'Are you sure you want to delete this cutter type?',
    pleaseEnterCutterType: 'Please enter the cutter type',
    cutterTypeLength: 'The cutter type can be up to ten characters long',
    cutterTypeRepeat: 'The cutter type is duplicated!',
    pleaseSelectDeleteContent: 'Please select the content to delete',
    onDeleteGeneralCutter: 'Cannot delete general cutter',
    onEditGeneralCutter: 'Cannot edit general cutter',
    cutterNameRepeat: 'The cutter name is duplicated',
    cutterNameLength: 'The cutter name can be up to ten characters long',
    cutterNameNoEmpty: 'Tool name cannot be empty!',
    noAxisType: 'No Axis Type',
    toAdd: 'Add',
    axisType: 'Axis Type',
    addAxisType: 'Add Axis Type',
    pleaseEnterAxisType: 'Please enter axis type',
    custom: 'Custom',
    toolType: 'Tool Type',
    fnType: 'Processing Method',
    pleaseSelectToolType: 'Please select tool type',
    pleaseSelectFnType: 'Please select processing method',
    pleaseEnterToolType: 'Please enter tool type',
    pleaseEnterFnType: 'Please enter processing method',
    confirmEdit: 'Are you sure you want to save the changes?',
    confirmAxisDelete: 'Are you sure you want to delete this axis type?',
    confirmToolDelete: 'Are you sure you want to delete this tool type?',
    confirmProcessTypeDelete: 'Are you sure you want to delete this processing method?',
    addAxisSuccess: 'Axis added successfully',
    deleteSuccess: 'Delete Successful',
    editSuccess: 'Edit Successful',
    editFail: 'Edit Failed',
    addSuccess: 'Add Successful',
    addFail: 'Add Failed',
    axisTypeExist: 'Axis type already exists',
    toolTypeExist: 'Tool type already exists',
    toolTypeNoExist: 'Tool type does not exist',
    fnTypeExist: 'Processing method already exists',
    axisExistError: 'The current axis type is in use, please edit after changing the axis type!',
    toolExistError: 'The current tool type is in use, please edit after changing the tool type!',
    fnExistError:
      'The current processing method is in use, please edit after changing the processing method!',
    axisExistDeleteError:
      'The current axis type is in use, please delete after changing the axis type!',
    toolExistDeleteError:
      'The current tool type is in use, please delete after changing the tool type!',
    fnExistDeleteError:
      'The current processing method is in use, please delete after changing the processing method!',
    hasExist: 'Already Exists',
    defaultCanNotDelete: 'Default field cannot be deleted'
  },
  decious: {
    cancel: 'Cancel',
    delete: 'Delete',
    batchDelete: 'Batch deletion',
    tips: 'Tips',
    confirmDelete: 'Delete',
    confirm: 'Confirm',
    add: 'Add',
    deciousConfig: 'Decious Config',
    noData: 'No Data',
    serialNumber: 'Num.',
    deciousName: 'Decious Name',
    counterControlWay: 'Reverse control method',
    executionDevice: 'Execution device / address',
    macroVariables: 'Macro',
    actionAssignment: 'Assignment',
    repositionAssignment: 'Reset Assignment',
    repositionSet: 'Reset settings',
    operate: 'OP',
    edit: 'Edit',
    confirmDelete1: ({ named }) => `Confirm deleting${named('val')}？`,
    deleteSccuss: 'Successfully deleted',
    selectData: 'Please select at least one piece of record.',
    pleaseEnter: 'Input',
    pleaseSelect: 'Select',
    action: 'action',
    please: 'Select',
    counterControlAddress: 'Reverse control address',
    repositionDelay: 'Reset delay(ms)',
    channel: 'Channel',
    fiveAction: 'Only supports adding up to 5 actions.',
    selectCounterControlWay: 'Please select reverse control method.',
    inputCounterControlAddress: 'Please enter reverse control address.',
    selectCounterControlAdress: 'Please select reverse control address.',
    inputActionAssignment: 'Please enter action assignment',
    inputRepositionAssignment: 'Please enter reset assignment',
    selectRepositionSet: 'Please select reset settings.',
    inputRepositionDelay: 'Please enter reset delay.',
    inputDeciousName: 'Please enter a decision name.',
    repositionDelayLimit: 'The range of reposition delay (ms) is between 10-3600000',
    shutdownDecision: 'Shutdown Decision',
    magnificationControl: 'Magnification Control',
    not: 'None',
    magnificationEquip: 'Magnification Equipment',
    executiveAddress: 'Executive Address',
    controlAssignment: 'Control Assignment',
    send: 'Send',
    debuggingPowerControl: 'Debugging Power Control',
    confirmDecision: 'Are you sure you want to send the decision debugging command?',
    editDecision: 'Edit Decision Configuration',
    inputMagnification: 'Please enter magnification',
    operateSuccess: 'Operation Successful',
    controlledPlant: 'Controlled Device',
    useDefault: 'Use Default',
    controlAssignmentDefault: 'Control Assignment: Follow Function',
    repositionAssignmentDefault: 'Reposition Assignment: Follow Function',
    isUseDefault: 'Please select whether to use default',
    inputControlAssignment: 'Please enter control assignment',
    followFunction: 'Follow Function',
    default: 'Default'
  },
  prepro: {
    cancel: 'Cancel',
    delete: 'Delete',
    confirmDeletion: 'Confirm',
    save: 'Save',
    add: 'Add',
    edit: 'Edit',
    confirmDelete: 'Are you sure you want to delete the selected content? ',
    confirm: 'Confirm',
    pleaseSelectDeleteContent: 'Please select the content to be deleted',
    deleteSuccess: 'Delete successfully! ',
    serialNumber: 'Num.',
    sensorName: 'sensor name',
    operatorName: 'operator name',
    metricAliases: 'metric aliases',
    signalName: 'signal name',
    signalResource: 'signal resource',
    signalAlgorithm: 'signal algorithm',
    signalOutputRate: 'signal output rate',
    tips: 'Tip',
    addSccess: 'Add successfully',
    editSccess: 'Edit successfully',
    cancelEditText: 'The current content has not been saved. Do you want to leave? ',
    pleaseSelect: 'Please select',
    pleaseEnter: 'Please enter',
    channel: 'channel',
    pleaseEnterMetricAliases: 'Please enter aliases of indicator ',
    metricAliasesExist: 'Metric alias already exists.',
    pleaseSelectSensor: 'Please select sensor.',
    pleaseSelectOperator: 'Please select operator.',
    pleaseSelectSensorName: 'Please select the sensor name.',
    pleaseSelectOperatorName: 'Please select the operator name.',
    pleaseEnterSignalName: 'Please enter signal name.',
    signalNameExist: 'Signal name already exists.',
    pleaseSelectSignalAlgorithm: 'Please select the signal algorithm.',
    pleaseEnterSignalOutputRate: 'Please enter output rate.',
    pleaseSelectSignal: 'Please select signal',
    pleaseEnterName: ({ named }) => `Please input ${named('val')}`,
    ruleInteger: ({ named }) => `${named('val')} must be an integer.`,
    ruleNumberText: 'Must be a number with at most one decimal place.',
    ruleNumber: ({ named }) => `${named('val')} must be a number.`,
    ruleRange: ({ named }) => `The range is between ${named('min')}~${named('max')}`
  },
  auxiiary: {
    processing: 'Processing',
    startCond: 'Status Condition',
    applyModel: 'Apply Module',
    relatedTies: 'Related Relationships: ',
    open: 'Open',
    close: 'Close',
    channel: 'Channel',
    stitchState: ({ named }) =>
      `Confirm ${named('status') === 0 ? 'Enable' : 'Disable'} auxiliary state [${named('val')}]?`
  },
  applicationCfg: {
    notAllowedDuringProcessing: 'Not allowed to modify during processing',
    commonConfiguration: 'General configuration',
    intelligent: 'Intelligent Adaptive Control',
    replacementMethod: 'Change-over Method',
    pleaseSelectReplacementMethod: 'Please select change-over method',
    maxSpeedAdjustmentRange: 'Max Speed Adjustment Range (%)',
    speedBoostDuration: 'Speed Boost Duration (ms)',
    slowDownDuration: 'Slow Down Duration (ms)',
    startStopJudgmentThreshold: 'Start-Stop Judgment Threshold',
    speedIDErrorRange: 'Speed ID Error Range (%)',
    machineToolDashboardRefreshFrequency: 'Machine Tool Dashboard Refresh Frequency (ms)',
    switchInOutStateDuration: 'Switch In/Out State Duration (s)',
    controlMode: 'Control Mode',
    noUGDControl: 'No UGD Control',
    efficiencyOptimization: 'Efficiency Optimization',
    editSuccess: 'Edit Success',
    operateSuccess: 'Operate Success',
    pleaseFillInCompleteInfo: 'Please Fill in Complete Information!',
    pleaseEnterAPositiveInteger: 'Please Enter a Positive Integer Greater Than 100!'
  },
  tempConfig: {
    newAddition: 'New Addition',
    serialNumber: 'Serial Number',
    templateName: 'Template Name',
    detectionTask: 'Detection Task',
    source: 'Source',
    version: 'Version',
    confirmDelete: 'Are you sure to delete this template',
    tips: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    deleteSuccessful: 'Delete successful',
    addTemplate: 'New template added',
    referencingTemplates: 'Referencing Templates',
    pleaseEnter: 'Please Enter',
    pleaseSelect: 'Please Select',
    formVerification1: 'Please enter the template name',
    formVerification2: 'Please select a reference template'
  }
}