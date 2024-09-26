import React, { useEffect, useState, Key, useCallback } from 'react';
import Tree from 'rc-tree';
import '../App.css';
import 'rc-tree/assets/index.css';
import { Tabs, Tab, } from '@mui/material';
import axios from 'axios';
import { useTreeData } from '../Context/TreeDataContext';
import PropertyTable from '../Components/PropertyTable';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
import SvgContent from '../Components/SvgContent';
import BASE_URL from '../Config/Config';
import { insertSvgContentIntoOffice } from '../Common/CommonFunctions';
import { Search, transformToTreeData } from '../Common/CommonFunctions';
import { TreeNodeProps } from 'rc-tree';
import { ReactSVG } from 'react-svg';

interface TreeNodeType {
  key: string;
  title: string | JSX.Element;
  isLeaf?: boolean;
  children?: TreeNodeType[];
  Type?: string;
  EQID?: string;
  ShapeID?: string;
  icon?: JSX.Element;
  visioDownloadUrl?: string;
  onClick?: () => void;
  null?: null
}

interface TreeDataProps {
  treeData: TreeNodeType[];
}

interface PropertyItem {
  pName: string;
  pValue: string | number;
  pType: string | number;
  newValue: string;
}


const Treedata: React.FC<TreeDataProps> = ({ treeData: initialTreeData }) => {
  const {
    treeData,
    relatedTree,
    setRelatedTree,
    setTreeData,
    addLeafNode,
    addLeafNodeToRelatedTree,
  } = useTreeData();

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<TreeNodeType | any>([]);
  const [relatedExpandedKeys, setRelatedExpandedKeys] = useState<string[]>([]);
  const [relatedSelectedKeys, setRelatedSelectedKeys] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState<number>(0);
  const [relatedDevicesVisible, setRelatedDevicesVisible] = useState<boolean>(false);
  const [propertyData, setPropertyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [stencilResponse, setStencilResponse] = useState<string>('');
  const [Eqid, setEqId] = useState<string | string>('');
  const [shapeCounter, setShapeCounter] = useState<number>(0);
  const [productnumber, setProductNumber] = useState<string[]>([])

  useEffect(() => {
    if (initialTreeData) {
      setTreeData(initialTreeData);
      // apply autoExppand on first tree render 

      autoExpandDefaultNodesOfTree(initialTreeData).then(async ({ expandedKeys, selectedKeys, selectedNode, isSelected }) => {
        setExpandedKeys(expandedKeys);

        if (selectedNode.Type && selectedNode.EQID && isSelected === false && selectedNode.ProductNumber) {
          let result = await callApiforDeviceShapeStencilEqid(selectedNode)
          setProductNumber(selectedNode.ProductNumber)
          if (result && result.shapenodes?.length > 0) {
            setSelectedKeys([result.shapenodes[0].key])
            setSelectedNode(result.shapenodes[0])
            if (result && result.shapenodes[0].ShapeID) {
              callApiForGetDevicePreview(result.shapenodes[0].ShapeID)
            }
          }
        } else if (
          selectedNode.Type && selectedNode.EQID && isSelected === true && selectedNode.ProductNumber) {
          RelatedandLibraryProperty(selectedNode.EQID)
          getStencilName(selectedNode.EQID)
          setSelectedKeys([selectedNode.key]);
          setSelectedNode(selectedNode)
          setProductNumber(selectedNode.ProductNumber)
        } else {
          setSelectedKeys([selectedNode.key])
          setSelectedNode(selectedNode)
        }
      });
      console.log('initial treeData', initialTreeData);
    }
  }, [initialTreeData]);

  //function of autoExpand
  const autoExpandDefaultNodesOfTree = async (treeData: TreeNodeType[]) => {
    let expKeys: any[] = [];
    let selKeys: any[] = [];
    let selNodes: any
    let isSelected = false;

    const expandAuto = async (nodes: TreeNodeType[]) => {
      for (let index = 0; index < nodes.length; index++) {
        const element = nodes[index];
        expKeys.push(element.key);

        if (element.children && element.children.length === 1) {
          isSelected = false
          await expandAuto(element.children);
        } else if (element.children && element.children.length > 1) {
          expKeys.push(element.key);
          selKeys.push(element.children[0].key);
          selNodes = element.children[0];
          isSelected = true;
          break;
        } else {
          selKeys.push(element.key);
          selNodes = element;
          break;
        }
      }
    };

    await expandAuto(treeData);

    return { expandedKeys: expKeys, selectedKeys: selKeys, selectedNode: selNodes, isSelected };
  };

  //set icons for tree
  const switcherIcon: React.FC<TreeNodeProps> = ({ expanded, isLeaf, selected }) => {
    if (isLeaf) {
      return null;
    }

    const svgColor = selected ? 'black' : 'var(--font-color)'; // Choose colors based on expanded state

    return expanded ? (
      <ReactSVG
        src="./assets/Icons/Down_128x128.svg"
        beforeInjection={(svg) => {
          svg.setAttribute('fill', svgColor);  // Set the fill color
          svg.setAttribute('height', '16px');  // Fix height
          svg.setAttribute('width', '16px');   // Fix width
        }}
      />
    ) : (
      <ReactSVG
        src="./assets/Icons/Down_128x128.svg"
        beforeInjection={(svg) => {
          svg.setAttribute('fill', svgColor);  // Set the fill color
          svg.setAttribute('height', '16px');  // Fix height
          svg.setAttribute('width', '16px');    // Fix width
        }}
        style={{ transform: 'rotate(270deg)' }}
      />
    );
  };


  // fetch shape node based on eqid 
  const generateUniqueKey = () => {
    return `visio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };
  const getDeviceShapes = async (
    selectedNode: TreeNodeType,
    addLeafNode: (key: string, ...leafNodes: TreeNodeType[]) => void,
    eqid: string,
    isRelatedTree: boolean = false
  ): Promise<TreeNodeType[]> => {
    try {
      const response = await axios.post(`${BASE_URL}GetDeviceShapes`, {
        Email: '',
        SubNo: '000000000000000000001234',
        EQID: eqid,
        Get3DShapes: true,
      });
      const shapesData = response.data.Data;

      const shapeLeafNodes = shapesData.map((shape: any) => ({
        key: shape.ShapeID,
        title: (
          <span title={`Drag and Drop to insert ${shape.Description} view`}>
            <span>{shape.Description}</span>
          </span>
        ),
        ShapeID: shape.ShapeID,
        EqId: eqid,
        icon: shape.Description.toLowerCase().includes('front') ? (
          <img src="./assets/Icons/Front.png" alt="Front icon" />
        ) : shape.Description.toLowerCase().includes('rear') ? (
          <img src="./assets/Icons/Rear.png" alt="Rear icon" />
        ) : shape.Description.toLowerCase().includes('top') ? (
          <img src="./assets/Icons/TopView.png" alt="Top Icon" />
        ) : null,
        isLeaf: true,
        children: [],
      }));

      if (!isRelatedTree && treeData) {
        addLeafNode(selectedNode.key, ...shapeLeafNodes);
      } else if (isRelatedTree && relatedTree) {
        addLeafNodeToRelatedTree(selectedNode.key, ...shapeLeafNodes);
      }

      return shapeLeafNodes;
    } catch (error) {
      console.error('Error fetching device shapes:', error);
      return [];
    }
  };

  //call api for get visio node and other property
  const getStencilNameByEQID = async (
    selectedNode: TreeNodeType,
    addLeafNode: (key: string, ...leafNodes: TreeNodeType[]) => void,
    eqid: string,
    isRelatedTree: boolean = false
  ): Promise<TreeNodeType | null> => {
    try {
      const response = await axios.post(`${BASE_URL}GetStencilNameByEQID`, { EQID: [eqid] });

      const stencilData = response.data?.Data[0]?.StencilName;
      const visioDownloadUrl = response.data?.Data[0]?.URL;
      setStencilResponse(stencilData);

      const handleVisioDownload = () => {
        if (visioDownloadUrl) {
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = visioDownloadUrl;
          link.download = 'visio_image.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error('Visio download URL is not available');
        }
      };
      // generate visio stencil node 
      const stencilLeafNode: TreeNodeType = {
        key: generateUniqueKey(),
        title: (
          <span title="Drag and Drop to save">
            <span>Visio Stencil</span>
          </span>
        ),
        icon: <img src="/assets/Icons/visio.png" alt="icon" />,
        isLeaf: true,
        children: [],
        visioDownloadUrl,
        onClick: handleVisioDownload,
      };

      if (!isRelatedTree && treeData) {
        addLeafNode(selectedNode.key, stencilLeafNode);
      } else if (isRelatedTree && relatedTree) {
        addLeafNodeToRelatedTree(selectedNode.key, stencilLeafNode);
      }

      return stencilLeafNode;
    } catch (error) {
      console.error('Error fetching stencil name:', error);
      return null;
    }
  };
  // fetch for stencil name on property table 
  const getStencilName = async (
    eqid: string
  ): Promise<TreeNodeType | null> => {
    try {
      const response = await axios.post(`${BASE_URL}GetStencilNameByEQID`, {
        EQID: [eqid],
      });

      const stencilData = response.data?.Data[0]?.StencilName;
      console.log('stencildata', stencilData)
      setStencilResponse(stencilData)
      return stencilData
    } catch (error) {
      console.error('Error fetching stencil name:', error);
      return null;
    }
  };
  //call parallel api for add node into parent key at once 
  const callApiforDeviceShapeStencilEqid = useCallback(async (selectedNode: TreeNodeType, isRelatedTree = false) => {
    setIsLoading(true);

    try {
      const eqId = selectedNode.EQID!;
      const addLeafNodeFn = isRelatedTree ? addLeafNodeToRelatedTree : addLeafNode;

      const shapenodes = await getDeviceShapes(selectedNode, addLeafNodeFn, eqId);
      const stencilNode = await getStencilNameByEQID(selectedNode, addLeafNodeFn, eqId);

      return { shapenodes, stencilNode };
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addLeafNode, addLeafNodeToRelatedTree, getDeviceShapes, getStencilNameByEQID]);


  //fetch related tab and and property table data
  const RelatedandLibraryProperty = useCallback(async (eqId: string) => {
    setIsLoading(true);
    try {
      const [relatedDevicesResponse, libraryPropertyResponse] = await Promise.all([
        axios.post(`${BASE_URL}HasRelatedDevices`, {
          Email: '',
          SubNo: '000000000000000000001234',
          EQID: eqId,
        }),
        axios.post(`${BASE_URL}GetLibraryPropertyWithSkeleton`, {
          Email: '',
          SubNo: '000000000000000000001234',
          EQID: eqId,
          FullLib: false,
          PropertyIDToShow: [],
        }),
      ]);

      console.log('Related Devices:', relatedDevicesResponse.data);
      console.log('Library Property:', libraryPropertyResponse.data);

      const librarypropertywithskeloton = libraryPropertyResponse.data.Data.libPropDetails.dtPropertySetSkeleton;
      const PropertyXMLString = libraryPropertyResponse.data.Data.libPropDetails.PropertyXMLString;

      const relatedDevice = relatedDevicesResponse.data === true;
      console.log('Related Device:', relatedDevice);

      setEqId(eqId);
      setPropertyValuesFromXML(librarypropertywithskeloton, PropertyXMLString);
      //show related tab based on response
      if (relatedDevice) {
        setRelatedDevicesVisible(true);
      } else {
        setRelatedDevicesVisible(false);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // fetch api for show device preview based on shapid on current node
  const callApiForGetDevicePreview = async (shapeId: string) => {
    try {
      const response = await axios.post(`${BASE_URL}GetDevicePreview`, {
        Email: '',
        SubNo: '000000000000000000001234',
        ShapeID: shapeId,
      });
      setSvgContent(response.data.Data.SVGFile);
      setPropertyData([])

      console.log('Device Preview Response:', response.data);
    } catch (error) {
      console.error('Error fetching device preview:', error);
    }
  };
  console.log('propertydata', propertyData)
  const setPropertyValuesFromXML = (
    librarypropertywithskeloton: PropertyItem[],
    PropertyXMLString: string
  ): void => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(PropertyXMLString, "text/xml");

      const updatedPropertyData = librarypropertywithskeloton.map((item) => {
        const propertyName = item.pName;
        const matchingElement = xmlDoc.querySelector(`Basic > ${propertyName}`);

        // Handle null or undefined textContent safely
        let newValue = matchingElement?.textContent?.trim() || item.pValue;

        // If the type is 'number', parse the value into a number
        if (item.pType === 'number') {
          const numericValue = parseFloat(newValue as string);
          newValue = isNaN(numericValue) ? item.pValue : numericValue;
        }

        return {
          ...item,
          pValue: newValue,
        };
      });

      setPropertyData(updatedPropertyData); // Assuming setPropertyData is defined elsewhere
    } catch (error) {
      console.error('Error parsing XML or setting property values:', error);
    }
  };

  // function for manually expand tree(related tab tree)
  const handleExpandRelatedTree = async (relatedExpandedKeys: any, { node, expanded, nativeEvent }: { node: any; expanded: boolean, nativeEvent: MouseEvent }) => {
    let newExpandedKeys = [...relatedExpandedKeys];
    const eqid = node.EQID;
    console.log('Expand/Collapse related tree node:', eqid);

    if (!expanded) {
      newExpandedKeys = newExpandedKeys.filter(key => key !== node.key);
      setRelatedExpandedKeys(newExpandedKeys);
      setRelatedSelectedKeys([node.key]);

      if (!node.EQID) {
        setPropertyData([]);
        setSvgContent(null);
        setEqId('');
      }
      if (node.EQID && node.Type) {
        await RelatedandLibraryProperty(node.EQID);
        await getStencilName(node.EQID);
      }
      return;
    }

    const { expandedKeys: autoExpandedKeys, selectedKeys: autoSelectedKeys, selectedNode, isSelected } = await autoExpandDefaultNodesOfTree([node]);

    newExpandedKeys = Array.from(new Set([...newExpandedKeys, ...autoExpandedKeys]));
    setRelatedExpandedKeys(newExpandedKeys);

    if (autoSelectedKeys.length > 0) {
      setRelatedSelectedKeys(autoSelectedKeys);
    }

    console.log('Selected Related Node:', selectedNode);
    console.log('Auto-selected related keys:', autoSelectedKeys);

    if (selectedNode && selectedNode.Type && selectedNode.EQID && isSelected === true && selectedNode.ProductNumber) {
      setRelatedSelectedKeys(autoSelectedKeys);
      setProductNumber(selectedNode.ProductNumber)
      await RelatedandLibraryProperty(selectedNode.EQID);
      await getStencilName(selectedNode.EQID);
    } else if (selectedNode && selectedNode.Type && selectedNode.EQID && isSelected === false && selectedNode.ProductNumber) {
      setProductNumber(selectedNode.ProductNumber)
      let result = await callApiforDeviceShapeStencilEqid(selectedNode, true);
      if (result && result.shapenodes?.length > 0) {
        setRelatedSelectedKeys([result.shapenodes[0].key]);
        if (result.shapenodes[0].ShapeID) {
          callApiForGetDevicePreview(result.shapenodes[0].ShapeID);
        }
      }
    } else if (selectedNode && selectedNode.ShapeID && selectedNode.EqId) {
      await callApiForGetDevicePreview(selectedNode.ShapeID);
      setRelatedDevicesVisible(true);
      setEqId(selectedNode.EqId);
    }
  };



  // function for manually expand tree(result tab tree)
  const handleExpandMainTree = async (expandedKeys: any, { node, expanded, }: { node: any; expanded: boolean; nativeEvent: MouseEvent }) => {
    let newExpandedKeys = [...expandedKeys]

    const eqid = node.EQID;
    console.log('Expand/Collapse node:', eqid);

    if (!expanded) {
      newExpandedKeys = newExpandedKeys.filter(key => key !== node.key);
      setExpandedKeys(newExpandedKeys);
      setSelectedKeys([node.key]);
      setSelectedNode(node);

      if (!node.EQID) {
        setPropertyData([]);
        setSvgContent(null);
        setEqId('');
        setRelatedDevicesVisible(false);
      } else if (node.EQID && node.Type) {
        setRelatedDevicesVisible(true)
        await RelatedandLibraryProperty(node.EQID);
        await getStencilName(node.EQID);
      }
      return;
    }
    const { expandedKeys: autoExpandedKeys, selectedKeys: autoSelectedKeys, selectedNode, isSelected } = await autoExpandDefaultNodesOfTree([node]);
    newExpandedKeys = Array.from(new Set([...newExpandedKeys, ...autoExpandedKeys]));
    setExpandedKeys(newExpandedKeys);

    if (autoSelectedKeys.length > 0) {
      setSelectedKeys(autoSelectedKeys);
      setSelectedNode(selectedNode);
    }
    if (selectedNode.Type && selectedNode.EQID && isSelected === true && selectedNode.ProductNumber) {
      await RelatedandLibraryProperty(selectedNode.EQID);
      await getStencilName(selectedNode.EQID);
      setSelectedKeys(autoSelectedKeys)
      setProductNumber(selectedNode.ProductNumber)
    } else if (selectedNode.Type && selectedNode.EQID && isSelected === false && selectedNode.ProductNumber) {
      const result: any = await callApiforDeviceShapeStencilEqid(selectedNode);

      if (result?.shapenodes?.length > 0) {
        setSelectedKeys([String(result.shapenodes[0].key)]);
        setSelectedNode([result.shapenodes[0]]);
        setProductNumber(selectedNode.ProductNumber)
        console.log('1234556789', selectedNode.ProductNumber)
        if (result.shapenodes[0].ShapeID) {
          await callApiForGetDevicePreview(result.shapenodes[0].ShapeID);
        }
      }
    }
    else if (selectedNode.ShapeID && selectedNode.EqId) {
      await callApiForGetDevicePreview(selectedNode.ShapeID);
    }

  };

  //logic 
  const handleSelectMainTree = async (selectedKeys: Key[], info: { event: "select"; selected: boolean; node: any; selectedNodes: any[]; nativeEvent: MouseEvent }) => {
    if (tabValue !== 0) return;

    const selectedNode = info.node;
    console.log("selected node info", selectedNode);

    setSelectedKeys([selectedNode.key]);
    setSelectedNode(selectedNode);

    if (selectedNode.key.includes('visio') && selectedNode.visioDownloadUrl) {
      selectedNode.onClick();
      return;
    }

    if (selectedNode.ShapeID && selectedNode.EqId) {
      await callApiForGetDevicePreview(selectedNode.ShapeID);
      setEqId(selectedNode.EqId);
    } else if (selectedNode.Type && selectedNode.EQID) {
      setSelectedKeys([selectedNode.key])
      await RelatedandLibraryProperty(selectedNode.EQID);
      await getStencilName(selectedNode.EQID);
      setSelectedNode([selectedNode])

    } else if (!selectedNode.Type && !selectedNode.EQID && !selectedNode.ShapeID) {
      setPropertyData([]);
      setSvgContent(null);
      setRelatedDevicesVisible(false);
    }

    console.log('Selected Keys:', selectedKeys);
  };

  useEffect(() => {
    console.log('selectednode', selectedNode)
  }, [selectedNode])

  useEffect(() => {
    console.log('resultExpanded', expandedKeys)
    console.log('relatedExpanded', relatedExpandedKeys)
  }, [expandedKeys, relatedExpandedKeys])

  const handleSelectRelatedTree = async (relatedSelectedKeys: Key[], info: { event: "select", selected: boolean; node: any, nativeEvent: MouseEvent }) => {
    if (tabValue !== 1) return;

    const selectedNodeRelated = info.node;
    console.log('relatedselected node info', selectedNodeRelated);

    setRelatedSelectedKeys([selectedNodeRelated.key]);

    if (selectedNodeRelated.key.toString().includes('visio') && selectedNodeRelated.visioDownloadUrl) {
      selectedNodeRelated.onClick();
      return;
    }

    if (selectedNodeRelated.EQID && selectedNodeRelated.Type) {
      setRelatedSelectedKeys([selectedNodeRelated.key]);

      await RelatedandLibraryProperty(selectedNodeRelated.EQID);
      await getStencilName(selectedNodeRelated.EQID);
    } else if (selectedNodeRelated.ShapeID) {
      await callApiForGetDevicePreview(selectedNodeRelated.ShapeID);
    } else if (!selectedNodeRelated.Type && !selectedNodeRelated.EQID && !selectedNodeRelated.ShapeID) {
      setPropertyData([]);
      setSvgContent(null);
    }
    console.log('related selected node', relatedSelectedKeys);
  };


  const handleTabChange = async (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 1) {
      setIsLoading(true);
      setPropertyData([]);
      setSvgContent(null);
      Search({ Eqid, related: true }, onRelatedSuccess, onerror);
      setIsLoading(false);
      setProductNumber([])
    }

    if (newValue === 0) {
      setSvgContent(null);
      setRelatedSelectedKeys([]);
      setSelectedKeys(selectedKeys);
      setSelectedNode(selectedNode)
      setExpandedKeys(expandedKeys);


      if (selectedNode) {
        if (selectedNode?.ShapeID) {
          await callApiForGetDevicePreview(selectedNode?.ShapeID);
        } else if (selectedNode.Type && selectedNode.EQID) {
          await RelatedandLibraryProperty(selectedNode.EQID);
          await getStencilName(selectedNode.EQID);
        } else if (selectedNode.Type && selectedNode?.EQID) {
          await RelatedandLibraryProperty(selectedNode?.EQID);
          await getStencilName(selectedNode?.EQID);
        }
      }
    }
  };

  const onRelatedSuccess = async (resultData: any) => {
    try {
      const RelatedTree = transformToTreeData(resultData);
      console.log('Related Tree:', resultData);
      setRelatedTree(RelatedTree)
      const { expandedKeys, selectedKeys, selectedNode, isSelected } = await autoExpandDefaultNodesOfTree(RelatedTree);

      setRelatedExpandedKeys(expandedKeys);
      setRelatedSelectedKeys(selectedKeys);
      if (selectedNode.Type && selectedNode.EQID && isSelected === false && selectedNode.ProductNumber) {
        setProductNumber(selectedNode.ProductNumber)
        let resultRelated = await callApiforDeviceShapeStencilEqid(selectedNode, true)

        if (resultRelated && resultRelated.shapenodes?.length > 0) {
          setRelatedSelectedKeys([resultRelated.shapenodes[0].key])
          if (resultRelated && resultRelated.shapenodes[0].ShapeID) {
            callApiForGetDevicePreview(resultRelated.shapenodes[0].ShapeID)
          }
        }
      } else if (selectedNode.Type && selectedNode.EQID && isSelected === true && selectedNode.ProductNumber) {
        selectedNode(selectedNode.ProductNumber)
        RelatedandLibraryProperty(selectedNode.EQID)
        getStencilName(selectedNode.EQID)
        setRelatedSelectedKeys(selectedKeys);
      }
    } catch (error) {
      console.error('Error handling related tree data:', error);
    }
  };
  const onerror = () => {
    console.log('related tree not found')
  }
  const handleDragStart = async (info: any) => {
    const { node } = info;
    console.log('Drag started on node:', node);

    try {
      const response = await axios.post(`${BASE_URL}GetDevicePreviewToDrawOnSlide`, {
        Email: '',
        SubNo: '000000000000000000001234',
        ShapeID: node.ShapeID
      });
      const svgonDragstart = response.data.Data.SVGFile

      await insertSvgContentIntoOffice(svgonDragstart, 'drag', shapeCounter)
      setShapeCounter(shapeCounter + 1)
      return response;
    } catch (error) {
      console.error('API Error:', error);
    }
  };


  return (
    <div className="tabs-container">
      <Backdrop
        className='backdrop'
        open={isLoading}>
        <CircularProgress className='circular-progress' />
      </Backdrop>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        TabIndicatorProps={{
          style: {
            display: 'none',
            color: 'var(--font-color)',
            height: '10px',
          },
        }}
        className="custom-tabs"
      >
        <Tab
          label="Result"
          disableRipple
          className="custom-tab"
        />
        {relatedDevicesVisible && (
          <Tab
            label="Related"
            disableRipple
            className="custom-tab-related"
          />
        )}
      </Tabs>

      {tabValue === 0 && (
        <>
          <Tree
            treeData={treeData}
            switcherIcon={switcherIcon}
            defaultExpandAll={false}
            showIcon={true}
            className="custom-rc-tree"
            expandedKeys={expandedKeys}
            onSelect={handleSelectMainTree}
            onExpand={handleExpandMainTree}
            selectedKeys={selectedKeys}
            draggable
            onDragStart={handleDragStart}
          />

          {propertyData && propertyData.length > 0 ? (
            <PropertyTable propertyData={propertyData} stencilResponse={stencilResponse} />
          ) : (
            svgContent && svgContent.length > 0 && <SvgContent svgContent={svgContent} productnumber={productnumber} />
          )}
        </>
      )}

      {tabValue === 1 && relatedDevicesVisible && (
        <>
          <Tree
            treeData={relatedTree}
            switcherIcon={switcherIcon}
            defaultExpandAll={false}
            showIcon={true}
            className="custom-rc-tree"
            expandedKeys={relatedExpandedKeys}
            selectedKeys={relatedSelectedKeys}
            draggable
            onSelect={handleSelectRelatedTree}
            onExpand={handleExpandRelatedTree}
            onDragStart={handleDragStart}
          />

          {(propertyData) && propertyData.length > 0 ? (
            <PropertyTable propertyData={propertyData} stencilResponse={stencilResponse} />
          ) : (
            svgContent && svgContent.length > 0 && <SvgContent svgContent={svgContent} productnumber={productnumber} />
          )}
        </>
      )}

    </div>

  );
};


export default Treedata;
