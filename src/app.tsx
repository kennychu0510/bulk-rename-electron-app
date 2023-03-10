import * as ReactDOM from 'react-dom';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Text, Button, Container, FileInput, Group, rem, useMantineTheme, Center, Input, TextInput, Grid, Title, Table, Checkbox } from '@mantine/core';
import { useInputState, useViewportSize } from '@mantine/hooks';
import { ArrowRight } from 'tabler-icons-react';

const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

type IFile = {
  checked: boolean;
  file: string;
};

root.render(<App />);

function App() {
  const theme = useMantineTheme();

  const ref = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { height, width } = useViewportSize();
  const [files, setFiles] = useState<IFile[]>([]);
  const [prefix, setPrefix] = useInputState('');
  const [suffix, setSuffix] = useInputState('');
  const [replace, setReplace] = useInputState('');
  const [replaceWith, setReplaceWith] = useInputState('');
  const [fileSummary, setFileSummary] = useState<Map<string, number>>(new Map());
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.setAttribute('directory', '');
      ref.current.setAttribute('webkitdirectory', '');
    }
  }, [ref]);

  async function onSelectDirectory() {
    // ref.current?.click()
    //@ts-ignore
    const { selectedDir, files, fileSummary } = (await electronAPI.selectDir()) as any;
    inputRef.current!.value = selectedDir;
    setFiles(files.map((item: any) => ({ checked: true, file: item })));
    setFileSummary(fileSummary);
    console.log(fileSummary);
  }

  async function onRename() {
    const filesToRename = files
      .filter((item) => item.checked)
      .map((item) => ({
        old: item.file,
        new: renamedText(item.file),
      }));

    //@ts-ignore
    const result = await electronAPI.renameFiles({ filesToRename });
    if (result.files) {
      setFiles(result.files.map((item: any) => ({ checked: true, file: item })));
    }
  }

  function onItemCheckChange(index: number) {
    setFiles((files) => {
      const updatedFiles = [...files];
      updatedFiles[index].checked = !updatedFiles[index].checked;
      return updatedFiles;
    });
  }

  function renamedText(fileName: string) {
    const output = `${prefix}${fileName}${suffix}`.replace(replace, replaceWith);
    return output;
  }

  function onHideSummary() {
    setShowSummary(false);
  }

  function onShowSummary() {
    setShowSummary(true);
  }

  function isCheckAll() {
    return files.every((item) => item.checked);
  }

  function onCheckAll(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setFiles((files) => files.map((item) => ({ ...item, checked: true })));
    } else {
      setFiles((files) => files.map((item) => ({ ...item, checked: false })));
    }
  }

  return (
    <div className='app'>
      <Container size={'md'} sx={{ flexDirection: 'column', display: 'flex', minWidth: '500px', margin: '20px 0' }}>
        <Container display={'flex'} sx={{ justifyContent: 'space-between', width: '100%', marginBottom: 20, padding: 0 }}>
          <Button onClick={onSelectDirectory}>Select Directory</Button>
          <Button onClick={onRename} color={'green'}>
            Rename
          </Button>
        </Container>
        <Input.Wrapper label='Path' styles={{ label: { color: 'white' } }}>
          <Input ref={inputRef} placeholder={'Path of Directory'} sx={{ width: '100%' }} />
        </Input.Wrapper>
        <Input.Wrapper label='Prefix' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Prefix' value={prefix} onChange={setPrefix} />
        </Input.Wrapper>
        <Input.Wrapper label='Suffix' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Suffix' value={suffix} onChange={setSuffix} />
        </Input.Wrapper>
        <Input.Wrapper label='Replace' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Replace' value={replace} onChange={setReplace} />
        </Input.Wrapper>
        <Input.Wrapper label='Replace With' styles={{ label: { color: 'white' } }} sx={{ marginTop: 20 }}>
          <Input placeholder='Replace With' value={replaceWith} onChange={setReplaceWith} />
        </Input.Wrapper>
        {files.length > 0 && (
          <>
            <Title order={3} sx={{ margin: '20px 0 10px' }}>
              Files:
            </Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <Title order={4} sx={{ marginTop: '5px' }}>
                Summary:
              </Title>
              {showSummary ? (
                <Button onClick={onHideSummary} color='orange'>
                  Hide Summary
                </Button>
              ) : (
                <Button color={'teal'} onClick={onShowSummary}>
                  Show Summary
                </Button>
              )}
            </div>
            {showSummary && (
              <Container w={'100%'} p={0}>
                {Array.from(fileSummary.entries()).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>{item[0]}</Text>
                    <Text>{item[1]}</Text>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text underline sx={{ fontWeight: 'bold' }}>
                    Total
                  </Text>
                  <Text underline sx={{ fontWeight: 'bold' }}>
                    {files.length}
                  </Text>
                </div>
              </Container>
            )}

            <Container w={'100%'} p={0} sx={{ marginTop: '10px' }}>
              {/* <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ flexGrow: 1, display: 'flex' }}>
                  <Checkbox sx={{ marginRight: 5 }} checked={isCheckAll()} onChange={onCheckAll} />
                  <Title order={4}>Original</Title>
                </div>
                <div style={{ flexBasis: '5%' }}></div>
                <div style={{ flexGrow: 1 }}>
                  <Title order={4}>After</Title>
                </div>
              </div> */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox sx={{ marginRight: 5 }} checked={isCheckAll()} onChange={onCheckAll} />
                <div style={{ width: '45%', wordWrap: 'break-word' }}>
                  <Title order={4}>Original</Title>
                </div>
                <div style={{ width: '30px' }}></div>
                <Title order={4}>After</Title>
              </div>
              {files.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox sx={{ marginRight: 5 }} checked={file.checked} onChange={() => onItemCheckChange(idx)} />
                  <div style={{ width: '45%', wordWrap: 'break-word' }}>
                    <Text>{file.file}</Text>
                  </div>
                  <div style={{ width: '30px' }}>
                    <ArrowRight color='white' />
                  </div>
                  <div style={{ width: '45%', wordWrap: 'break-word' }}>{file.checked ? <Text>{renamedText(file.file)}</Text> : <Text>{file.file}</Text>}</div>
                </div>
              ))}
            </Container>
          </>
        )}
      </Container>
    </div>
  );
}
