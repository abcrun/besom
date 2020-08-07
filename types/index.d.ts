declare namespace Besom {
  create = (elm: HTMLElement) => maintaince;
  element = (elm: HTMLElement) => gelement;

  type cb = (currentEvt: any, startEvt: any) => void;

  interface maintaince {
    enable: (firstGesture:string, ...restGestures:string[]) => void;
    disable: (firstGesture:string, ...restGestures:string[]) => void;
    on: (name: string, cb: cb) => void;
    delegate: (cls: string, name:string, cb: cb) => void;
    destroy: () => void;
  }

  type offset = {
    width: number;
    height: number;
    left: number;
    top: number;
  }

  type ppoint = {
    pageX: number;
    pageY: number;
  }

  type point = {
    x: number;
    y: number;
  }

  interface gelement {
    offset: () => offset; 
    getPointOrigin: (p: ppoint) => point;
    setPointAsOrigin: (p: ppoint) => void;
    translate: (offset: { x: number, y: number }, transition: string) => void;
    scale: (increase: number, transition: string) => void;
    rotate: (rotate: number, transition: string) => void;
    pos: (params: { left?: number; top?: number; width?: number; height?: number }, transition: string) => void;
  }
}
