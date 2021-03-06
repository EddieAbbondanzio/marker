import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { PromisedInput } from "../../shared/promisedInput";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { isBlank } from "../../shared/utils";
import { Store } from "../store";
import { mt1, p1, p2, py1, THEME, w100 } from "../css";
import { Focusable, wasInsideFocusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import { useMouseDrag } from "../io/mouse";
import { findParent } from "../utils/findParent";
import { Section } from "../../shared/ui/app";

export const SIDEBAR_MENU_ATTRIBUTE = "data-nav-menu";
export const SIDEBAR_MENU_HEIGHT = 24;
export const SIDEBAR_MENU_INDENT = 10;
export const SIDEBAR_ICON_WIDTH = 20;
export const SIDEBAR_MENU_FONT_SIZE = "1.2rem";

interface SidebarMenuProps {
  icon?: IconDefinition;
  depth: number;
  id: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
  onIconClick: (ev: React.MouseEvent) => void;
  onDrag: (newParent?: string) => void;
  store: Store;
}

export function SidebarMenu(props: SidebarMenuProps): JSX.Element {
  const { value, icon, isSelected, onClick, store } = props;
  const { state } = store;

  const iconOffset = icon ? 0 : 8;
  const paddingLeft = `${props.depth * SIDEBAR_MENU_INDENT + iconOffset}px`;

  let backgroundColor;
  if (isSelected) {
    backgroundColor = THEME.sidebar.selected;
  }

  const menuRef = useRef<HTMLAnchorElement>(null);
  const onDrag = useCallback(
    (drag) => {
      if (drag?.state === "dragEnded") {
        const newParent = getSidebarMenuAttribute(
          drag.event.target as HTMLElement
        );

        if (newParent != null) {
          props.onDrag(newParent);
        }
        // Drags that end outside of the sidebar should be considered cancels.
        else if (wasInsideFocusable(drag.event, Section.Sidebar)) {
          props.onDrag();
        }
      }
    },
    [props]
  );

  useMouseDrag(menuRef, onDrag, {
    cursor: "grabbing",
    disabled: state.sidebar.input != null,
  });

  return (
    <StyledMenu
      ref={menuRef}
      style={{ paddingLeft, backgroundColor }}
      onClick={onClick}
      {...{ [SIDEBAR_MENU_ATTRIBUTE]: props.id }}
    >
      {icon && (
        <StyledMenuIcon
          icon={icon}
          size="xs"
          onClick={(ev) => props.onIconClick(ev)}
        />
      )}
      <StyledMenuText
        style={{ paddingLeft: !icon ? `${SIDEBAR_ICON_WIDTH}px` : undefined }}
      >
        {value}
      </StyledMenuText>
    </StyledMenu>
  );
}

const StyledMenu = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: ${SIDEBAR_MENU_HEIGHT}px;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  cursor: pointer;
  &:hover {
    background-color: ${THEME.sidebar.hover};
  }
`;

const StyledMenuIcon = styled(Icon)`
  color: ${THEME.sidebar.font};
  width: ${SIDEBAR_ICON_WIDTH}px;
  padding: 0;
  text-align: center;
  font-size: ${SIDEBAR_MENU_FONT_SIZE};
`;

const StyledMenuText = styled.div`
  color: ${THEME.sidebar.font};
  font-size: ${SIDEBAR_MENU_FONT_SIZE};
`;

export interface SidebarInputProps {
  store: Store;
  value: PromisedInput;
  depth: number;
  icon?: IconDefinition;
}

export function SidebarInput(props: SidebarInputProps): JSX.Element {
  const paddingLeft = `${
    props.depth * SIDEBAR_MENU_INDENT +
    // Adjust by 8 to account for real size of icon width (28px).
    (props.icon == null ? SIDEBAR_ICON_WIDTH + 8 : 0)
  }px`;
  const inputRef = useRef(null! as HTMLInputElement);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [isValid, setIsValid] = useState(true);

  const { cancel } = props.value;
  const tryConfirm = () => {
    if (isValid) {
      props.value.confirm();
    }
  };

  const onBlur = () => {
    if (isBlank(props.value.value)) {
      cancel();
    } else {
      props.value.confirm();
    }
  };

  const onChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { validate, onChange: setChanges } = props.value;
    const { value } = ev.target;

    // Apply validation if needed
    if (validate != null) {
      const validateOutcome = validate(value);
      if (!validateOutcome.valid) {
        setErrorMessage(validateOutcome.errors[0]);
      } else {
        setErrorMessage(undefined);
      }
      setIsValid(validateOutcome.valid);
    }

    setChanges(value);
  };

  const keyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const key = parseKeyCode(ev.code);
    switch (key) {
      case KeyCode.Enter:
        return tryConfirm();
      case KeyCode.Escape:
        return cancel();
    }
  };

  return (
    <Indented style={{ paddingLeft }}>
      <StyledFocusable
        store={props.store}
        name={Section.SidebarInput}
        elementRef={inputRef}
        onBlur={onBlur}
      >
        <StyledDiv>
          {props.icon && <StyledMenuIcon icon={props.icon} size="xs" />}
          <StyledInput
            ref={inputRef}
            value={props.value.value}
            onChange={onChange}
            onKeyDown={keyDown}
            data-testid="sidebar-input"
          />
        </StyledDiv>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </StyledFocusable>
    </Indented>
  );
}

const Indented = styled.div`
  background-color: ${THEME.sidebar.hover};
  height: 28px;
`;

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
`;

// Keep height consistent with sidebar item
const StyledInput = styled.input`
  ${w100};
  border: none;
  outline: none;
  -webkit-appearance: none;
  height: 2rem;
  font-size: ${SIDEBAR_MENU_FONT_SIZE};
  padding-left: 0;
  background-color: ${THEME.sidebar.input.background};
  color: ${THEME.sidebar.input.font};
  ${py1};
`;

const ErrorMessage = styled.div`
  background-color: ${THEME.sidebar.error.background};
  color: ${THEME.sidebar.error.font};
  font-size: ${SIDEBAR_MENU_FONT_SIZE};
  border-radius: 0.4rem;
  position: relative;
  ${mt1}
  ${p2}
`;

export function getSidebarMenuAttribute(element: HTMLElement): string | null {
  return findParent(element, (el) => el.hasAttribute(SIDEBAR_MENU_ATTRIBUTE), {
    matchValue: (el) => el.getAttribute(SIDEBAR_MENU_ATTRIBUTE),
  });
}
